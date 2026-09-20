import type { Activity, Task } from '../../types';
import { formatRelative, getInitials } from '../../utils/format';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ACTION_LABELS: Record<string, string> = {
  task_created: 'membuat task ini',
  task_assigned: 'mengubah penugasan',
  status_changed: 'mengubah status',
  file_uploaded: 'mengunggah file',
  comment_added: 'menambahkan komentar',
  task_completed: 'menyelesaikan task',
};

const ACTION_COLORS: Record<string, string> = {
  task_created: 'bg-blue-500',
  task_assigned: 'bg-purple-500',
  status_changed: 'bg-amber-500',
  file_uploaded: 'bg-emerald-500',
  comment_added: 'bg-cyan-500',
  task_completed: 'bg-emerald-600',
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-surface-400 text-center py-4">
        Belum ada aktivitas.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-surface-200" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const meta = activity.metadata as Record<string, any>;
          let detail = '';

          if (activity.action === 'status_changed' || activity.action === 'task_completed') {
            detail = `${meta?.from ?? '?'} → ${meta?.to ?? '?'}`;
          } else if (activity.action === 'file_uploaded') {
            detail = meta?.fileName ?? '';
          } else if (activity.action === 'task_assigned') {
            detail = meta?.assignedToName
              ? `ke ${meta.assignedToName}`
              : '';
          }

          return (
            <div key={activity._id} className="relative flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 z-10 ${ACTION_COLORS[activity.action] ?? 'bg-surface-400'}`}
              >
                {getInitials(activity.userId.name)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-surface-700">
                  <span className="font-medium text-surface-900">
                    {activity.userId.name}
                  </span>{' '}
                  {ACTION_LABELS[activity.action] ?? activity.action}
                  {detail && (
                    <>
                      {' '}
                      <span className="text-surface-500 font-mono text-xs bg-surface-100 px-1.5 py-0.5 rounded">
                        {detail}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {formatRelative(activity.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}