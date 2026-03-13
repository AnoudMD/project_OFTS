export type Role = 'Consumer' | 'Producer' | 'Certifier' | 'Distributor' | 'Retailer';
export type CertificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Certified Organic';
export type EventType =
  | 'Harvest'
  | 'Processing'
  | 'Quality Check'
  | 'Packaging'
  | 'Shipment'
  | 'Distribution';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface SupplyChainEvent {
  id: string;
  batchId: string;
  eventType: EventType;
  location: string;
  timestamp: string;
  notes?: string;
  actorRole: Role;
}

export interface Batch {
  id: string;
  batchId: string;
  productName: string;
  farmName: string;
  productionDate: string;
  expiryDate: string;
  notes?: string;
  certificationStatus: CertificationStatus;
  certificationDocument?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  events: SupplyChainEvent[];
}

export interface ScanHistoryItem {
  batchId: string;
  productName: string;
  farmName: string;
  status: CertificationStatus;
  scannedAt: string;
}
