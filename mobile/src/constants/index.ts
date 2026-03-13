// ─── API ──────────────────────────────────────────────────────────────────────

// Change this to your local machine's IP when testing on a real device.
// Use http://10.0.2.2:5000/api for Android emulator.
// Use http://localhost:5000/api for iOS simulator.
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

// ─── Colors ───────────────────────────────────────────────────────────────────

export const COLORS = {
  // Primary green palette
  primary:       '#16a34a',
  primaryDark:   '#166534',
  primaryLight:  '#dcfce7',
  primaryMid:    '#15803d',

  // Backgrounds
  background:    '#f0fdf4',
  surface:       '#ffffff',
  card:          '#ffffff',

  // Text
  textPrimary:   '#14532d',
  textSecondary: '#4b7c5f',
  textMuted:     '#86a08f',
  textInverse:   '#ffffff',

  // Borders
  border:        '#d1fae5',
  borderFocus:   '#16a34a',

  // Status colors
  pending:       { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  underReview:   { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  approved:      { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  certified:     { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  rejected:      { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },

  // Event type colors
  harvest:       { bg: '#fef9c3', text: '#713f12' },
  processing:    { bg: '#dbeafe', text: '#1e40af' },
  qualityCheck:  { bg: '#f3e8ff', text: '#6b21a8' },
  packaging:     { bg: '#ffedd5', text: '#9a3412' },
  shipment:      { bg: '#cffafe', text: '#155e75' },
  distribution:  { bg: '#dcfce7', text: '#14532d' },
  retail:        { bg: '#fce7f3', text: '#9d174d' },

  // Utility
  error:         '#dc2626',
  warning:       '#d97706',
  success:       '#16a34a',
  shadow:        '#000000',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  regular:   400,
  medium:    500,
  semiBold:  600,
  bold:      700,
} as const;

export const SIZES = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   15,
  lg:   16,
  xl:   18,
  xxl:  22,
  xxxl: 28,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl:32,
} as const;

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
} as const;

// ─── Demo accounts ────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS = [
  { role: 'producer'    as const, email: 'producer@ofts.com',    password: 'password123', name: 'Sarah Johnson' },
  { role: 'certifier'   as const, email: 'certifier@ofts.com',   password: 'password123', name: 'James Chen' },
  { role: 'distributor' as const, email: 'distributor@ofts.com', password: 'password123', name: 'Maria Rodriguez' },
  { role: 'retailer'    as const, email: 'retailer@ofts.com',    password: 'password123', name: 'David Kim' },
];

// ─── Event types ──────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  'Harvest',
  'Processing',
  'Quality Check',
  'Packaging',
  'Shipment',
  'Distribution',
  'Retail',
] as const;

// ─── Valid demo batch IDs ─────────────────────────────────────────────────────

export const DEMO_BATCH_CODES = [
  'OT-2025-001234',
  'OT-2025-005678',
  'OT-2025-009012',
  'OT-2025-003456',
];
