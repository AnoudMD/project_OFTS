export const COLORS = {
  primary: '#166534',
  primaryLight: '#22c55e',
  primaryBg: '#f0fdf4',
  primaryMid: '#dcfce7',
  accent: '#15803d',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  red: '#ef4444',
  redLight: '#fee2e2',
  redDark: '#991b1b',
  yellow: '#f59e0b',
  yellowLight: '#fef3c7',
  yellowDark: '#92400e',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  blueDark: '#1e40af',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pending: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  'Under Review': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  Approved: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  Certified: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  Harvest: '#166534',
  Processing: '#0369a1',
  'Quality Check': '#7c3aed',
  Packaging: '#92400e',
  Shipment: '#1e40af',
  Distribution: '#065f46',
  Retail: '#be185d',
};

export const ROLES = ['Producer', 'Certifier', 'Distributor', 'Retailer'] as const;

export const EVENT_TYPES = [
  'Harvest',
  'Processing',
  'Quality Check',
  'Packaging',
  'Shipment',
  'Distribution',
  'Retail',
] as const;

export const STATUS_FILTERS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const;
