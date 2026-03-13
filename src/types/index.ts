// ── OFTS Type Definitions ──────────────────────────────────────────────────

export type UserRole =
  | 'consumer'
  | 'producer'
  | 'certifier'
  | 'distributor'
  | 'retailer';

export type CertificationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Certified' | 'Rejected';

export type EventType =
  | 'Harvest'
  | 'Processing'
  | 'Quality Check'
  | 'Packaging'
  | 'Shipment'
  | 'Distribution';

export type DocumentType = 'PDF' | 'PNG' | 'JPG';

// ── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar?: string;
}

// ── Supply Chain Event ────────────────────────────────────────────────────

export interface SupplyChainEvent {
  id: string;
  batchId: string;
  eventType: EventType;
  location: string;
  timestamp: string;       // ISO-8601
  notes?: string;
  actorRole: UserRole;
  actorName: string;
}

// ── Certification Document ────────────────────────────────────────────────

export interface CertificationDocument {
  id: string;
  name: string;
  type: DocumentType;
  size?: string;           // e.g. "2.4 MB"
  uploadedAt: string;      // ISO-8601
}

// ── Product Batch ─────────────────────────────────────────────────────────

export interface ProductBatch {
  id: string;
  batchId: string;         // e.g. "OT-2025-001234"
  productName: string;
  farmName: string;
  producerName: string;
  producerId: string;
  category: string;        // e.g. "Coffee", "Tea", "Grains"
  origin: string;          // Country/Region
  productionDate: string;  // YYYY-MM-DD
  expiryDate: string;      // YYYY-MM-DD
  quantity?: string;       // e.g. "500 kg"
  notes?: string;
  certificationStatus: CertificationStatus;
  certifierNotes?: string;
  reviewedAt?: string;     // ISO-8601
  reviewedBy?: string;
  certificationDocuments: CertificationDocument[];
  events: SupplyChainEvent[];
  createdAt: string;       // ISO-8601
}

// ── Scan Record ───────────────────────────────────────────────────────────

export interface ScanRecord {
  id: string;
  batchId: string;
  scannedAt: string;       // ISO-8601
  productName: string;
  farmName: string;
  certificationStatus: CertificationStatus;
}

// ── Form Types ────────────────────────────────────────────────────────────

export interface LoginFormData {
  role: UserRole;
  email: string;
  password: string;
}

export interface CreateBatchFormData {
  productName: string;
  farmName: string;
  category: string;
  origin: string;
  quantity: string;
  productionDate: string;
  expiryDate: string;
  notes: string;
  documentName?: string;
}

export interface AddEventFormData {
  batchId: string;
  eventType: EventType;
  location: string;
  timestamp: string;
  notes: string;
}

export interface ReviewBatchFormData {
  status: CertificationStatus;
  notes: string;
}

// ── Filter Types ──────────────────────────────────────────────────────────

export type StatusFilter = 'All' | CertificationStatus;

export interface BatchFilters {
  search: string;
  status: StatusFilter;
  startDate: string;
  endDate: string;
}

// ── App State ─────────────────────────────────────────────────────────────

export interface AppState {
  user: User | null;
  batches: ProductBatch[];
  scanHistory: ScanRecord[];
}

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_BATCH'; payload: ProductBatch }
  | { type: 'UPDATE_BATCH'; payload: ProductBatch }
  | { type: 'ADD_EVENT'; payload: { batchId: string; event: SupplyChainEvent } }
  | { type: 'ADD_SCAN_RECORD'; payload: ScanRecord }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };
