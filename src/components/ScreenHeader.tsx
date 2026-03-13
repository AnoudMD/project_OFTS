'use client';

import { ChevronLeft } from 'lucide-react';
import { type ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Alias for right — either prop name works */
  rightAction?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function ScreenHeader({ title, subtitle, onBack, right, rightAction, className = '' }: ScreenHeaderProps) {
  const rightSlot = right ?? rightAction;
  return (
    <div className={`flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-gray-100 flex-shrink-0 ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition flex-shrink-0"
        >
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </div>
  );
}
