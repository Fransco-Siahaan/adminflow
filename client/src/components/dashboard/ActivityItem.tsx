import { Link } from 'react-router-dom';
import type { Activity, Task, User } from '../../types';
import { formatRelative } from '../../utils/format';

interface ActivityItemProps {
  activity: Activity;
}

const ACTION_LABELS: Record<string, string> = {
  task_created: 'membuat task baru',
  task_assigned: 'menugaskan task',
  status_changed: 'mengubah status',
  file_uploaded: 'mengunggah file',
  comment_added: 'menambahkan komentar',
  task_completed: 'menyelesaikan task',
};

const ACTION_COLORS: Record<string, string> = {
  task_created: 'bg-blue-100 text-blue-600',
  task_assigned: 'bg-purple-100 text-purple-600',
  status_changed: 'bg-amber-100 text-amber-600',
  file_uploaded: 'bg-emerald-100 text-emerald-600',
  comment_added: 'bg-cyan-100 text-cyan-600',
  task_completed: 'bg-emerald-100 text-emerald-600',
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  // Handle task yang sudah dihapus
  const task = activity.taskId;
  const taskObj = task && typeof task === 'object' ? (task as Task) : null;
  const taskTitle = taskObj?.title || 'Task yang sudah dihapus';
  const taskId = taskObj?._id ?? null;

  // Handle user yang sudah dihapus
  const user = activity.userId as User | null | undefined;
  const userName = user?.name || 'User yang sudah dihapus';
  const isDeletedUser = !user?.name;

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
          isDeletedUser
            ? 'bg-surface-200 text-surface-500'
            : ACTION_COLORS[activity.action] || 'bg-surface-100 text-surface-600'
        }`}
      >
        {userName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700">
          <span
            className={`font-medium ${
              isDeletedUser
                ? 'text-surface-500 italic'
                : 'text-surface-900'
            }`}
          >
            {userName}
          </span>{' '}
          {ACTION_LABELS[activity.action] || activity.action}{' '}
          {taskId ? (
            <Link
              to={`/tasks/${taskId}`}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {taskTitle}
            </Link>
          ) : (
            <span className="font-medium text-surface-500 italic">
              {taskTitle}
            </span>
          )}
        </p>
        <p className="text-xs text-surface-400 mt-0.5">
          {formatRelative(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}