'use client';

interface LeafLogoProps {
  size?: number;
  className?: string;
}

export function LeafLogo({ size = 64, className = '' }: LeafLogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-green-700 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Leaf shape */}
        <path
          d="M20 4C20 4 6 10 6 22C6 30 12.5 35 20 35C27.5 35 34 30 34 22C34 10 20 4 20 4Z"
          fill="white"
          fillOpacity="0.9"
        />
        {/* Center vein */}
        <path
          d="M20 35V14"
          stroke="#166534"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Side veins left */}
        <path d="M20 22 L13 17" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M20 27 L12 23" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
        {/* Side veins right */}
        <path d="M20 22 L27 17" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M20 27 L28 23" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
