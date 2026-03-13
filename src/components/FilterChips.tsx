'use client';

interface FilterChipsProps {
  filters: string[];
  active: string;
  onChange: (val: string) => void;
  counts?: Record<string, number>;
  className?: string;
}

export function FilterChips({ filters, active, onChange, counts, className = '' }: FilterChipsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      {filters.map((f) => {
        const count = counts?.[f];
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              active === f
                ? 'bg-green-700 text-white border-green-700 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
            }`}
          >
            {f}
            {count !== undefined && (
              <span
                className={`text-[10px] font-bold rounded-full px-1 min-w-[16px] text-center leading-tight ${
                  active === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
