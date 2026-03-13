import { COLORS } from '../constants';
import type { CertificationStatus, EventType, UserRole } from '../types';

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateBatchId(): string {
  const year = new Date().getFullYear();
  const num  = Math.floor(100000 + Math.random() * 900000).toString();
  return `OT-${year}-${num}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function getStatusStyle(status: CertificationStatus): {
  bg: string; text: string; border: string;
} {
  switch (status) {
    case 'Pending':       return COLORS.pending;
    case 'Under Review':  return COLORS.underReview;
    case 'Approved':      return COLORS.approved;
    case 'Certified':     return COLORS.certified;
    case 'Rejected':      return COLORS.rejected;
    default:              return COLORS.pending;
  }
}

export function getEventStyle(type: EventType): { bg: string; text: string } {
  switch (type) {
    case 'Harvest':       return COLORS.harvest;
    case 'Processing':    return COLORS.processing;
    case 'Quality Check': return COLORS.qualityCheck;
    case 'Packaging':     return COLORS.packaging;
    case 'Shipment':      return COLORS.shipment;
    case 'Distribution':  return COLORS.distribution;
    case 'Retail':        return COLORS.retail;
    default:              return COLORS.harvest;
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'producer':    return 'Producer';
    case 'certifier':   return 'Certifier';
    case 'distributor': return 'Distributor';
    case 'retailer':    return 'Retailer';
    case 'consumer':    return 'Consumer';
    default:            return role;
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateRequired(val: string): boolean {
  return val.trim().length > 0;
}
