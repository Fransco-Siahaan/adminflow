import type { ReactNode } from 'react';
interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  hint?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  hint,
}: StatCardProps) {
  const variantConfig = {
    default: {
      bg: 'bg-surface-100',
      text: 'text-surface-600',
      value: 'text-surface-900',
    },
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      value: 'text-surface-900',
    },
    success: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      value: 'text-surface-900',
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      value: 'text-surface-900',
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      value: 'text-surface-900',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      value: 'text-surface-900',
    },
  }[variant];

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-surface-500">{label}</p>
        <div
          className={`w-9 h-9 rounded-lg ${variantConfig.bg} ${variantConfig.text} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${variantConfig.value}`}>{value}</p>
      {hint && <p className="text-xs text-surface-400 mt-1">{hint}</p>}
    </div>
  );
}