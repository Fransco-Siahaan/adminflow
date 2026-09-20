import { Link } from 'react-router-dom';
import type { Attachment, Task } from '../../types';
import { formatFileSize, formatRelative, getInitials } from '../../utils/format';

interface DocumentCardProps {
  attachment: Attachment;
}

// Icon helper
function FileIcon({ mime }: { mime: string }) {
  const cls = 'w-6 h-6';
  if (mime.startsWith('image/')) {
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (mime === 'application/pdf') {
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// File icon color based on type
function getFileColor(mime: string): string {
  if (mime.startsWith('image/')) return 'bg-emerald-100 text-emerald-600';
  if (mime === 'application/pdf') return 'bg-red-100 text-red-600';
  if (mime.includes('word')) return 'bg-blue-100 text-blue-600';
  if (mime.includes('sheet') || mime.includes('excel'))
    return 'bg-emerald-100 text-emerald-600';
  return 'bg-surface-100 text-surface-600';
}

export default function DocumentCard({ attachment }: DocumentCardProps) {
  const uploadsUrl =
    import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';

  const task =
    attachment.taskId && typeof attachment.taskId === 'object'
      ? (attachment.taskId as Task)
      : null;

  const taskId = task?._id ?? null;
  const taskTitle = task?.title ?? 'Task yang sudah dihapus';

  return (
    <div className="card p-4 hover:shadow-card-hover transition-shadow duration-200 group">
      <div className="flex items-start gap-3">
        {/* File icon */}
        <a
          href={`${uploadsUrl}${attachment.fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(attachment.mimeType)}`}
        >
          <FileIcon mime={attachment.mimeType} />
        </a>

        <div className="flex-1 min-w-0">
          <a
            href={`${uploadsUrl}${attachment.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium text-surface-900 hover:text-primary-700 truncate"
            title={attachment.fileName}
          >
            {attachment.fileName}
          </a>

          <p className="text-xs text-surface-500 mt-0.5">
            {formatFileSize(attachment.fileSize)} ·{' '}
            {formatRelative(attachment.createdAt)}
          </p>

          {/* Task info */}
          <div className="mt-3 pt-3 border-t border-surface-100">
            <p className="text-xs text-surface-500 mb-1">Dari task:</p>
            {taskId ? (
              <Link
                to={`/tasks/${taskId}`}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 truncate block"
                title={taskTitle}
              >
                → {taskTitle}
              </Link>
            ) : (
              <p className="text-xs text-surface-400 italic truncate">
                → {taskTitle}
              </p>
            )}
          </div>

          {/* Uploader */}
          <div className="mt-3 flex items-center gap-2 text-xs text-surface-500">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-[9px] font-semibold">
              {getInitials(attachment.userId.name)}
            </div>
            <span className="truncate">{attachment.userId.name}</span>
          </div>
        </div>

        {/* Download button */}
        <a
          href={`${uploadsUrl}${attachment.fileUrl}`}
          download={attachment.fileName}
          className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Download"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>
    </div>
  );
}