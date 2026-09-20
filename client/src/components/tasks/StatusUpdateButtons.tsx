import { useState } from 'react';
import { api, getErrorMessage } from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';
import type { Task, TaskStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StatusUpdateButtonsProps {
  task: Task;
  onSuccess: () => void;
}

export default function StatusUpdateButtons({
  task,
  onSuccess,
}: StatusUpdateButtonsProps) {
  const toast = useToast();
  const { isManager, user } = useAuth();
  const [isLoading, setIsLoading] = useState<TaskStatus | null>(null);

  const isAssigned = task.assignedTo?._id === user?._id;

  const update = async (status: TaskStatus) => {
    setIsLoading(status);
    try {
      await api.patch(`/tasks/${task._id}/status`, { status });
      toast.success(`Status diubah ke "${status}"`);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(null);
    }
  };

  // Staff: hanya bisa in_progress atau review untuk task-nya
  const staffActions: { status: TaskStatus; label: string; variant: 'primary' | 'secondary' }[] = [
    { status: 'in_progress', label: 'Mulai Kerjakan', variant: 'primary' },
    { status: 'review', label: 'Submit untuk Review', variant: 'secondary' },
  ];

  // Manager: bisa set semua status
  const managerActions: { status: TaskStatus; label: string; variant: 'primary' | 'secondary' | 'danger' }[] = [
    { status: 'completed', label: 'Approve & Selesaikan', variant: 'primary' },
    { status: 'needs_revision', label: 'Minta Revisi', variant: 'danger' },
  ];

  // Filter berdasarkan status sekarang
  const availableStaffActions = staffActions.filter((a) => {
    if (a.status === 'in_progress' && task.status === 'pending') return true;
    if (a.status === 'in_progress' && task.status === 'needs_revision') return true;
    if (a.status === 'review' && task.status === 'in_progress') return true;
    return false;
  });

  const availableManagerActions = managerActions.filter((a) => {
    if (a.status === 'completed' && task.status === 'review') return true;
    if (a.status === 'needs_revision' && task.status === 'review') return true;
    return false;
  });

  // Manager juga bisa paksa status apapun (fallback)
  const showManagerFallback = isManager && task.status !== 'completed';

  if (
    !isManager &&
    (!isAssigned || availableStaffActions.length === 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
        Update Status
      </h3>

      {/* Manager actions */}
      {isManager && availableManagerActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableManagerActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() => update(action.status)}
              isLoading={isLoading === action.status}
              disabled={isLoading !== null}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Staff actions */}
      {!isManager && availableStaffActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableStaffActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() => update(action.status)}
              isLoading={isLoading === action.status}
              disabled={isLoading !== null}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Manager fallback: paksa status apapun */}
      {showManagerFallback && availableManagerActions.length === 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => update('completed')}
            isLoading={isLoading === 'completed'}
          >
            Tandai Selesai
          </Button>
        </div>
      )}
    </div>
  );
}