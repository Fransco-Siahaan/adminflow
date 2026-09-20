import { Link } from 'react-router-dom';
import type { Task } from '../../types';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { formatDate, getDeadlineStatus } from '../../utils/format';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const deadlineStatus = getDeadlineStatus(task.deadline, task.status);

  const deadlineColor = {
    overdue: 'text-danger',
    today: 'text-warning',
    soon: 'text-warning',
    normal: 'text-surface-500',
    completed: 'text-surface-400',
  }[deadlineStatus];

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="block card p-4 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-surface-900 group-hover:text-primary-700 transition-colors line-clamp-2">
          {task.title}
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <p className="text-sm text-surface-500 line-clamp-2 mb-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <svg
            className={`w-3.5 h-3.5 ${deadlineColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={deadlineColor}>{formatDate(task.deadline)}</span>
        </div>
      </div>

      {task.assignedTo && (
        <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-2 text-xs text-surface-500">
          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-[10px] font-semibold">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
          <span>{task.assignedTo.name}</span>
        </div>
      )}
    </Link>
  );
}