'use client';

import { type LucideIcon } from 'lucide-react';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
  active: string;
  onSelect: (key: string) => void;
}

export function BottomNav({ items, active, onSelect }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 shadow-xl z-40">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                isActive ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 ${
                  isActive ? 'bg-green-100' : ''
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
