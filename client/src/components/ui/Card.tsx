import type { ReactNode } from 'react';
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  return (
    <div
      className={`card ${paddingClass} ${hover ? 'hover:shadow-card-hover transition-shadow duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}