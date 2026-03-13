import { STATUS_COLORS, EVENT_TYPE_COLORS } from '@/src/constants';
import type { CertificationStatus, EventType } from '@/src/types';

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDateInput(iso: string): string {
  return iso.split('T')[0];
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

export function getStatusStyle(status: CertificationStatus | string) {
  return STATUS_COLORS[status] ?? STATUS_COLORS['Pending'];
}

export function getEventColor(eventType: EventType | string): string {
  return EVENT_TYPE_COLORS[eventType] ?? '#6b7280';
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateBatchId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `OT-${year}-${num}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidBatchId(id: string): boolean {
  return /^OT-\d{4}-\d{6}$/.test(id.trim());
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Text Helpers ─────────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export function roleLabel(role: string): string {
  return capitalize(role);
}
