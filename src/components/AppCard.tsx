'use client';

import { type ReactNode } from 'react';

interface AppCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function AppCard({ children, className = '', padding = 'md', onClick }: AppCardProps) {
  const padClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const clickable = onClick
    ? 'cursor-pointer hover:shadow-md transition-shadow duration-150 active:scale-[0.99]'
    : '';

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${padClasses[padding]} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
