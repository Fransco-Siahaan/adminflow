import { Link } from 'react-router-dom';
import type { Activity, Task, User } from '../../types';
import {
  formatRelative,
  formatDateTime,
  getInitials,
} from '../../utils/format';

interface ActivityRowProps {
  activity: Activity;
}

const ACTION_LABELS: Record<string, string> = {
  task_created: 'Membuat task baru',
  task_assigned: 'Mengubah penugasan',
  status_changed: 'Mengubah status',
  file_uploaded: 'Mengunggah file',
  comment_added: 'Menambahkan komentar',
  task_completed: 'Menyelesaikan task',
};

const ACTION_STYLES: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  task_created: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  task_assigned: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  status_changed: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  file_uploaded: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  comment_added: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  task_completed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function ActivityRow({ activity }: ActivityRowProps) {
  // Handle task yang sudah dihapus
  const task = activity.taskId;
  const taskObj = task && typeof task === 'object' ? (task as Task) : null;
  const taskTitle = taskObj?.title || 'Task yang sudah dihapus';
  const taskId = taskObj?._id ?? null;

  // Handle user yang sudah dihapus
  const user = activity.userId as User | null | undefined;
  const userName = user?.name || 'User yang sudah dihapus';
  const isDeletedUser = !user?.name;

  const style = ACTION_STYLES[activity.action] || {
    bg: 'bg-surface-100',
    text: 'text-surface-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const meta = activity.metadata as Record<string, any>;
  let detail = '';
  if (activity.action === 'status_changed' || activity.action === 'task_completed') {
    const from = meta?.from ?? '?';
    const to = meta?.to ?? '?';
    detail = `${from} → ${to}`;
  } else if (activity.action === 'file_uploaded') {
    detail = meta?.fileName ?? '';
  } else if (activity.action === 'task_assigned' && meta?.assignedToName) {
    detail = `ke ${meta.assignedToName}`;
  }

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-surface-50 transition-colors">
      {/* User avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
          isDeletedUser
            ? 'bg-surface-200 text-surface-500'
            : 'bg-primary-100 text-primary-700'
        }`}
      >
        {getInitials(userName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium text-sm ${
              isDeletedUser
                ? 'text-surface-500 italic'
                : 'text-surface-900'
            }`}
          >
            {userName}
          </span>
          {user?.role && (
            <span className="text-xs text-surface-400">
              {user.role === 'manager' ? '👔' : '🧑‍💼'}
            </span>
          )}
          <span className="text-sm text-surface-600">
            {ACTION_LABELS[activity.action] || activity.action}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {taskId ? (
            <Link
              to={`/tasks/${taskId}`}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline truncate max-w-md"
              title={taskTitle}
            >
              {taskTitle}
            </Link>
          ) : (
            <span className="text-sm text-surface-400 italic">{taskTitle}</span>
          )}

          {detail && (
            <span className="text-xs font-mono text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
              {detail}
            </span>
          )}
        </div>

        <p
          className="text-xs text-surface-400 mt-1"
          title={formatDateTime(activity.createdAt)}
        >
          {formatRelative(activity.createdAt)}
        </p>
      </div>

      {/* Action icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text}`}
      >
        {style.icon}
      </div>
    </div>
  );
}