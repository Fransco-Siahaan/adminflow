import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}