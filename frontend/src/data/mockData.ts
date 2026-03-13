import { Batch, ScanHistoryItem, SupplyChainEvent, User } from '../types/traceability';

export const users: User[] = [
  {
    id: 'u1',
    name: 'Avery Patel',
    email: 'producer@ofts.com',
    role: 'Producer',
  },
  {
    id: 'u2',
    name: 'Morgan Lee',
    email: 'certifier@ofts.com',
    role: 'Certifier',
  },
  {
    id: 'u3',
    name: 'Jordan Kim',
    email: 'distributor@ofts.com',
    role: 'Distributor',
  },
  {
    id: 'u4',
    name: 'Riley Chen',
    email: 'retailer@ofts.com',
    role: 'Retailer',
  },
];

export const initialEvents: SupplyChainEvent[] = [
  {
    id: 'e1',
    batchId: 'OT-2025-001234',
    eventType: 'Harvest',
    location: 'Green Valley Organic Farm, CA',
    timestamp: '2025-02-14T08:30:00.000Z',
    notes: 'Hand-picked at peak ripeness.',
    actorRole: 'Producer',
  },
  {
    id: 'e2',
    batchId: 'OT-2025-001234',
    eventType: 'Processing',
    location: 'Valley Processing Center, CA',
    timestamp: '2025-02-16T10:00:00.000Z',
    notes: 'Wet-processed and sun-dried.',
    actorRole: 'Producer',
  },
  {
    id: 'e3',
    batchId: 'OT-2025-001234',
    eventType: 'Quality Check',
    location: 'OFTS Lab, CA',
    timestamp: '2025-02-20T15:45:00.000Z',
    notes: 'Certified organic compliance verified.',
    actorRole: 'Certifier',
  },
  {
    id: 'e4',
    batchId: 'OT-2025-001234',
    eventType: 'Packaging',
    location: 'Eco Pack Facility, CA',
    timestamp: '2025-02-23T09:20:00.000Z',
    notes: 'Sealed in biodegradable packs.',
    actorRole: 'Distributor',
  },
  {
    id: 'e5',
    batchId: 'OT-2025-001234',
    eventType: 'Shipment',
    location: 'Northern Distribution Hub, CA',
    timestamp: '2025-02-26T12:00:00.000Z',
    notes: 'Outbound shipment #SH-8892.',
    actorRole: 'Distributor',
  },
  {
    id: 'e6',
    batchId: 'OT-2025-001234',
    eventType: 'Distribution',
    location: 'Sunrise Market, San Francisco',
    timestamp: '2025-03-01T08:15:00.000Z',
    notes: 'Stocked in organic aisle.',
    actorRole: 'Retailer',
  },
];

export const initialBatches: Batch[] = [
  {
    id: 'b1',
    batchId: 'OT-2025-001234',
    productName: 'Organic Arabica Coffee Beans',
    farmName: 'Green Valley Organic Farm',
    productionDate: '2025-02-12',
    expiryDate: '2026-02-12',
    notes: 'Single-origin, shade-grown beans.',
    certificationStatus: 'Certified Organic',
    certificationDocument: 'OFTS_Cert_2025.pdf',
    status: 'Approved',
    events: initialEvents,
  },
  {
    id: 'b2',
    batchId: 'OT-2025-004589',
    productName: 'Organic Golden Honey',
    farmName: 'Highland Bee Collective',
    productionDate: '2025-01-05',
    expiryDate: '2026-01-04',
    notes: 'Raw, unfiltered, and sustainably harvested.',
    certificationStatus: 'Pending',
    certificationDocument: 'Honey_Cert_2025.pdf',
    status: 'Pending',
    events: [],
  },
  {
    id: 'b3',
    batchId: 'OT-2025-007702',
    productName: 'Organic Baby Spinach',
    farmName: 'Willow Creek Organics',
    productionDate: '2025-02-20',
    expiryDate: '2025-03-20',
    notes: 'Cold-chain maintained for freshness.',
    certificationStatus: 'Rejected',
    certificationDocument: 'Spinach_Cert_2025.pdf',
    status: 'Rejected',
    events: [],
  },
];

export const initialScanHistory: ScanHistoryItem[] = [
  {
    batchId: 'OT-2025-001234',
    productName: 'Organic Arabica Coffee Beans',
    farmName: 'Green Valley Organic Farm',
    status: 'Certified Organic',
    scannedAt: '2025-03-10T10:10:00.000Z',
  },
  {
    batchId: 'OT-2025-004589',
    productName: 'Organic Golden Honey',
    farmName: 'Highland Bee Collective',
    status: 'Pending',
    scannedAt: '2025-03-08T14:45:00.000Z',
  },
];
