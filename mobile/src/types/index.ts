// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'consumer' | 'producer' | 'certifier' | 'distributor' | 'retailer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Certification & Status ───────────────────────────────────────────────────

export type CertificationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Certified'
  | 'Rejected';

export type EventType =
  | 'Harvest'
  | 'Processing'
  | 'Quality Check'
  | 'Packaging'
  | 'Shipment'
  | 'Distribution'
  | 'Retail';

// ─── Certification Document ───────────────────────────────────────────────────

export interface CertificationDocument {
  name: string;
  url: string;
  uploadedAt: string;
}

// ─── Supply Chain Event ───────────────────────────────────────────────────────

export interface SupplyChainEvent {
  _id: string;
  batchId: string;
  eventType: EventType;
  location: string;
  timestamp: string;
  notes?: string;
  actorRole: UserRole;
  actorName?: string;
}

// ─── Batch ───────────────────────────────────────────────────────────────────

export interface Batch {
  _id: string;
  batchId: string;
  productName: string;
  farmName: string;
  producerName: string;
  producerId: string;
  category: string;
  origin: string;
  productionDate: string;
  expiryDate: string;
  quantity?: string;
  notes?: string;
  certificationStatus: CertificationStatus;
  certifierNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  certificationDocuments: CertificationDocument[];
  events: SupplyChainEvent[];
  createdAt: string;
}

// ─── Certification ────────────────────────────────────────────────────────────

export interface Certification {
  _id: string;
  batchId: string;
  certifierId: string;
  certifierName?: string;
  status: CertificationStatus;
  remarks?: string;
  auditHistory: Array<{
    status: CertificationStatus;
    remarks?: string;
    changedBy: string;
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Scan History ─────────────────────────────────────────────────────────────

export interface ScanRecord {
  _id: string;
  batchId: string;
  productName: string;
  farmName: string;
  certificationStatus: CertificationStatus;
  scannedAt: string;
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  QRScanner: undefined;
  TraceabilityResult: { batchCode: string };
  TraceabilityHistory: { batchId: string };
  ScanHistory: undefined;
  ProducerTabs: undefined;
  CertifierTabs: undefined;
  DistributorTabs: undefined;
  RetailerTabs: undefined;
};

export type ProducerTabParamList = {
  ProducerDashboard: undefined;
  CreateBatch: undefined;
  BatchList: { role: UserRole };
};

export type CertifierTabParamList = {
  CertifierDashboard: undefined;
  PendingBatches: { role: UserRole };
  ReviewBatch: { batchId: string };
};

export type DistributorTabParamList = {
  DistributorDashboard: undefined;
  BatchList: { role: UserRole };
  AddEvent: { batchId?: string; role: UserRole };
};

export type RetailerTabParamList = {
  RetailerDashboard: undefined;
  BatchList: { role: UserRole };
  AddEvent: { batchId?: string; role: UserRole };
};
