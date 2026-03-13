'use client';

import { type ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
}

/**
 * Constrains the app to a mobile-sized centered container
 * and applies a phone-like background.
 */
export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      <div className="relative w-full max-w-sm min-h-screen bg-gray-50 shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
