'use client';

import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <Icon size={26} className="text-green-500" />
        </div>
      )}
      <p className="text-gray-800 font-semibold text-base mb-1">{title}</p>
      {description && <p className="text-gray-400 text-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
