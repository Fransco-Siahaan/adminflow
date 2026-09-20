import { ReactNode } from 'react';
import type { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: ReactNode;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  className?: string;
}

export default function Badge({
  children,
  color = 'gray',
  className = '',
}: BadgeProps) {
  const colorClass = {
    gray: 'bg-surface-100 text-surface-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  }[color];

  return (
    <span className={`badge ${colorClass} ${className}`}>{children}</span>
  );
}

// ===== Helper component: Priority Badge =====
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = {
    low: { label: 'Low', color: 'gray' as const },
    medium: { label: 'Medium', color: 'blue' as const },
    high: { label: 'High', color: 'orange' as const },
    urgent: { label: 'Urgent', color: 'red' as const },
  };
  const { label, color } = config[priority];
  return <Badge color={color}>{label}</Badge>;
}

// ===== Helper component: Status Badge =====
export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = {
    pending: { label: 'Pending', color: 'gray' as const },
    in_progress: { label: 'In Progress', color: 'blue' as const },
    review: { label: 'Review', color: 'yellow' as const },
    completed: { label: 'Completed', color: 'green' as const },
    needs_revision: { label: 'Needs Revision', color: 'red' as const },
  };
  const { label, color } = config[status];
  return <Badge color={color}>{label}</Badge>;
}