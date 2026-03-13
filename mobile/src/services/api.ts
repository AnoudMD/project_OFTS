/**
 * OFTS API Service
 * Connects to the Express/MongoDB backend at API_BASE_URL.
 * Falls back gracefully to mock data when the backend is unreachable.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import { MOCK_BATCHES, MOCK_SCAN_HISTORY, MOCK_USERS } from '../data/mockData';
import type {
  User, Batch, ScanRecord, Certification, SupplyChainEvent,
  CertificationStatus, EventType, UserRole,
} from '../types';

const TOKEN_KEY = 'ofts_token';
const USER_KEY  = 'ofts_user';

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || msg; } catch {}
      throw new ApiError(res.status, msg);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'Network unreachable');
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

interface AuthResponse { token: string; user: User; }

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    await saveToken(data.token);
    await saveUser(data.user);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      // Backend unreachable — use mock auth
      return mockLogin(email, password);
    }
    throw err;
  }
}

export async function apiRegister(
  name: string, email: string, password: string, role: UserRole,
): Promise<AuthResponse> {
  try {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }, false);
    await saveToken(data.token);
    await saveUser(data.user);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) throw new Error('Backend unavailable');
    throw err;
  }
}

export async function apiGetMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

// ─── BATCHES ──────────────────────────────────────────────────────────────────

interface BatchListResponse { batches: Batch[]; total: number; }

export async function apiListBatches(params?: {
  status?: CertificationStatus; search?: string; limit?: number;
}): Promise<BatchListResponse> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('certificationStatus', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.limit)  qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch<BatchListResponse>(`/batches${query}`);
  } catch {
    return { batches: MOCK_BATCHES, total: MOCK_BATCHES.length };
  }
}

export async function apiGetBatch(id: string): Promise<Batch> {
  try {
    return apiFetch<Batch>(`/batches/${id}`);
  } catch {
    const b = MOCK_BATCHES.find(x => x._id === id || x.batchId === id);
    if (b) return b;
    throw new ApiError(404, 'Batch not found');
  }
}

export async function apiLookupBatchByCode(batchCode: string): Promise<Batch> {
  try {
    return apiFetch<Batch>(`/batches/code/${batchCode}`, {}, false);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const b = MOCK_BATCHES.find(x => x.batchId === batchCode);
    if (b) return b;
    throw new ApiError(404, 'Batch not found');
  }
}

export async function apiCreateBatch(payload: {
  productName: string; farmName: string; category: string; origin: string;
  productionDate: string; expiryDate: string; quantity?: string; notes?: string;
}): Promise<Batch> {
  try {
    return apiFetch<Batch>('/batches', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      return mockCreateBatch(payload);
    }
    throw err;
  }
}

export async function apiCertifyBatch(
  batchId: string, decision: CertificationStatus, notes?: string,
): Promise<Batch> {
  try {
    return apiFetch<Batch>(`/batches/${batchId}/certify`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, notes }),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      const b = MOCK_BATCHES.find(x => x._id === batchId || x.batchId === batchId)!;
      return { ...b, certificationStatus: decision, certifierNotes: notes, reviewedAt: new Date().toISOString() };
    }
    throw err;
  }
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────

export async function apiGetEvents(batchId: string): Promise<SupplyChainEvent[]> {
  try {
    return apiFetch<SupplyChainEvent[]>(`/events/${batchId}`);
  } catch {
    return MOCK_BATCHES.find(b => b._id === batchId || b.batchId === batchId)?.events ?? [];
  }
}

export async function apiAddEvent(payload: {
  batchId: string; eventType: EventType; location: string;
  timestamp: string; notes?: string;
}): Promise<SupplyChainEvent> {
  try {
    return apiFetch<SupplyChainEvent>('/events', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      return {
        _id: `mock-${Date.now()}`,
        actorRole: 'distributor',
        actorName: 'Demo User',
        ...payload,
      } as SupplyChainEvent;
    }
    throw err;
  }
}

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────

export async function apiGetCertifications(batchId: string): Promise<Certification[]> {
  try {
    return apiFetch<Certification[]>(`/certifications/${batchId}`);
  } catch {
    return [];
  }
}

// ─── SCAN HISTORY ─────────────────────────────────────────────────────────────

export async function apiGetScanHistory(): Promise<ScanRecord[]> {
  try {
    return apiFetch<ScanRecord[]>('/scans/me');
  } catch {
    return MOCK_SCAN_HISTORY;
  }
}

export async function apiSaveScan(scan: {
  batchId: string; productName: string; farmName: string; certificationStatus: CertificationStatus;
}): Promise<void> {
  try {
    await apiFetch('/scans', { method: 'POST', body: JSON.stringify(scan) });
  } catch {
    // Non-fatal
  }
}

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

export async function apiUploadCertDoc(
  batchId: string,
  file: { uri: string; name: string; type: string },
): Promise<{ url: string; name: string }> {
  const token = await getToken();
  const form  = new FormData();
  form.append('batchId', batchId);
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);

  try {
    const res = await fetch(`${API_BASE_URL}/uploads/certification`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    });
    if (!res.ok) throw new ApiError(res.status, 'Upload failed');
    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Mock upload when backend unavailable
    return { url: `https://example.com/certs/${file.name}`, name: file.name };
  }
}

// ─── MOCK HELPERS ─────────────────────────────────────────────────────────────

import { generateBatchId } from '../utils';

function mockLogin(email: string, password: string): AuthResponse {
  const account = MOCK_USERS.find(u => u.email === email);
  if (!account || password !== account.password) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const user: User = {
    _id:       `mock-${account.role}`,
    name:      account.name,
    email:     account.email,
    role:      account.role,
    createdAt: new Date().toISOString(),
  };
  const token = `mock-jwt-${account.role}-${Date.now()}`;
  return { token, user };
}

function mockCreateBatch(payload: {
  productName: string; farmName: string; category: string; origin: string;
  productionDate: string; expiryDate: string; quantity?: string; notes?: string;
}): Batch {
  return {
    _id:                    `mock-${Date.now()}`,
    batchId:                generateBatchId(),
    producerName:           'Demo Producer',
    producerId:             'mock-producer',
    certificationStatus:    'Pending',
    certificationDocuments: [],
    events:                 [],
    createdAt:              new Date().toISOString(),
    ...payload,
  } as Batch;
}
