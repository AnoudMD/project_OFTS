'use client';

import { getStatusStyle } from '@/src/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const style = getStatusStyle(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  };

  const dot = {
    Approved: '●',
    Certified: '●',
    Pending: '◐',
    'Under Review': '◔',
    Rejected: '✕',
  }[status] ?? '●';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <span className="text-[10px] leading-none">{dot}</span>
      {status}
    </span>
  );
}
