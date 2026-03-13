/**
 * src/services/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed fetch wrapper for all OFTS API endpoints.
 *
 * BASE_URL points to the local Express backend.
 * When running the preview (Next.js only, no backend), every call will fail
 * gracefully and the screens fall back to mock data automatically.
 *
 * To connect to the real backend:
 *   1. cd backend && npm install && npm run dev
 *   2. The BASE_URL below should match your backend port (default: 5000)
 */

import type {
  User, ProductBatch, SupplyChainEvent, ScanRecord,
  CertificationStatus, EventType,
} from '@/src/types';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Change this if your backend runs on a different host/port.
const BASE_URL = 'http://localhost:5000/api';

// ── Token storage (localStorage — browser only) ───────────────────────────────

const TOKEN_KEY = 'ofts_jwt';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setStoredToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ }
}

export function clearStoredToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
}

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Core fetcher ──────────────────────────────────────────────────────────────

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  requireAuth?: boolean;
  headers?: Record<string, string>;
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, requireAuth = true, headers = {} } = opts;

  const reqHeaders: Record<string, string> = { ...headers };

  if (body && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = getStoredToken();
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(res.status, `HTTP ${res.status} — unexpected response format`);
  }

  if (!res.ok) {
    throw new ApiError(res.status, (data.error as string) ?? `HTTP ${res.status}`);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    requireAuth: false,
  });
  setStoredToken(data.token);
  return data;
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  organization: string;
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    requireAuth: false,
  });
  setStoredToken(data.token);
  return data;
}

export async function apiGetMe(): Promise<User> {
  const res = await apiFetch<{ user: User }>('/auth/me');
  return res.user;
}

// ── Batches ───────────────────────────────────────────────────────────────────

export interface BatchListResponse {
  batches: ProductBatch[];
  total: number;
  page: number;
  limit: number;
}

export interface BatchQueryFilters {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function apiListBatches(filters: BatchQueryFilters = {}): Promise<BatchListResponse> {
  const params = new URLSearchParams();
  if (filters.search)    params.set('search',    filters.search);
  if (filters.status && filters.status !== 'All') params.set('status', filters.status);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate)   params.set('endDate',   filters.endDate);
  if (filters.page)      params.set('page',      String(filters.page));
  if (filters.limit)     params.set('limit',     String(filters.limit));

  const qs = params.toString();
  return apiFetch<BatchListResponse>(`/batches${qs ? `?${qs}` : ''}`);
}

/** Public lookup by human-readable batch code — no auth required */
export async function apiLookupBatch(code: string): Promise<ProductBatch> {
  const res = await apiFetch<{ batch: ProductBatch }>(
    `/batches/code/${encodeURIComponent(code.toUpperCase())}`,
    { requireAuth: false },
  );
  return res.batch;
}

export async function apiGetBatch(id: string): Promise<ProductBatch> {
  const res = await apiFetch<{ batch: ProductBatch }>(`/batches/${id}`);
  return res.batch;
}

export interface CreateBatchPayload {
  productName: string;
  farmName: string;
  category: string;
  origin: string;
  productionDate: string;
  expiryDate: string;
  quantity?: string;
  notes?: string;
}

export async function apiCreateBatch(payload: CreateBatchPayload): Promise<ProductBatch> {
  const res = await apiFetch<{ batch: ProductBatch }>('/batches', {
    method: 'POST',
    body: payload,
  });
  return res.batch;
}

export async function apiUpdateBatch(
  id: string,
  payload: Partial<CreateBatchPayload>,
): Promise<ProductBatch> {
  const res = await apiFetch<{ batch: ProductBatch }>(`/batches/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.batch;
}

// ── Supply Chain Events ───────────────────────────────────────────────────────

export async function apiGetEvents(batchId: string): Promise<SupplyChainEvent[]> {
  const res = await apiFetch<{ events: SupplyChainEvent[] }>(`/events/${batchId}`);
  return res.events;
}

export interface AddEventPayload {
  batchId: string;
  eventType: EventType;
  location: string;
  timestamp: string;
  notes?: string;
}

export async function apiAddEvent(payload: AddEventPayload): Promise<SupplyChainEvent> {
  const res = await apiFetch<{ event: SupplyChainEvent }>('/events', {
    method: 'POST',
    body: payload,
  });
  return res.event;
}

// ── Certifications ────────────────────────────────────────────────────────────

export interface CertifyPayload {
  decision: CertificationStatus;
  notes?: string;
}

export interface CertifyResponse {
  batch: {
    id: string;
    batchId: string;
    certificationStatus: CertificationStatus;
    certifierNotes?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  };
}

export async function apiCertifyBatch(
  batchId: string,
  payload: CertifyPayload,
): Promise<CertifyResponse> {
  return apiFetch<CertifyResponse>(`/batches/${batchId}/certify`, {
    method: 'POST',
    body: payload,
  });
}

export async function apiGetCertification(batchId: string) {
  return apiFetch<{ certification: unknown }>(`/certifications/${batchId}`);
}

// ── Scan History ──────────────────────────────────────────────────────────────

export async function apiGetMyScanHistory(): Promise<ScanRecord[]> {
  const res = await apiFetch<{ scanHistory: ScanRecord[] }>('/scans/me');
  return res.scanHistory;
}

export async function apiRecordScan(batchId: string): Promise<ScanRecord> {
  const res = await apiFetch<{ record: ScanRecord }>('/scans', {
    method: 'POST',
    body: { batchId },
  });
  return res.record;
}

// ── File Upload ───────────────────────────────────────────────────────────────

export interface UploadedFile {
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export async function apiUploadCertification(
  file: File,
  batchId?: string,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  if (batchId) formData.append('batchId', batchId);

  const res = await apiFetch<{ file: UploadedFile }>('/uploads/certification', {
    method: 'POST',
    body: formData,
  });
  return res.file;
}
