'use client';

import { getEventColor } from '@/src/utils';

interface EventTypeBadgeProps {
  eventType: string;
  size?: 'sm' | 'md';
}

export function EventTypeBadge({ eventType, size = 'md' }: EventTypeBadgeProps) {
  const color = getEventColor(eventType);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: color + '18', color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {eventType}
    </span>
  );
}
