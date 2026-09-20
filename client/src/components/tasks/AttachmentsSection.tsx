import { useRef, useState } from 'react';
import { api, getErrorMessage } from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatRelative, formatFileSize, getInitials } from '../../utils/format';
import type { Attachment } from '../../types';

interface AttachmentsSectionProps {
  taskId: string;
  attachments: Attachment[];
  onRefetch: () => void;
}

// Icon berdasarkan mime type
function FileIcon({ mime }: { mime: string }) {
  const cls = 'w-5 h-5';
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

export default function AttachmentsSection({
  taskId,
  attachments,
  onRefetch,
}: AttachmentsSectionProps) {
  const toast = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi client-side
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe file tidak diizinkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File berhasil diupload');
      onRefetch();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/attachments/${deleteId}`);
      toast.success('File dihapus');
      setDeleteId(null);
      onRefetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
          Dokumen ({attachments.length})
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
        >
          + Upload
        </Button>
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-surface-400 text-center py-4">
          Belum ada dokumen.
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => {
            const canDelete =
              att.userId._id === user?._id || user?.role === 'manager';

            return (
              <div
                key={att._id}
                className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <FileIcon mime={att.mimeType} />
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={`${uploadsUrl}${att.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-surface-900 hover:text-primary-700 block truncate"
                  >
                    {att.fileName}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                    <span>{formatFileSize(att.fileSize)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-surface-200 flex items-center justify-center text-[8px] font-semibold text-surface-600">
                        {getInitials(att.userId.name)}
                      </span>
                      {att.userId.name}
                    </span>
                    <span>·</span>
                    <span>{formatRelative(att.createdAt)}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => setDeleteId(att._id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-danger hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Dokumen"
        message="Yakin ingin menghapus dokumen ini? File akan dihapus permanen."
        confirmText="Hapus"
        isLoading={isDeleting}
      />
    </div>
  );
}