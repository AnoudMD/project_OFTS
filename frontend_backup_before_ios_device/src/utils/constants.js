const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
export const ROLES = ['Producer', 'Certifier', 'Distributor', 'Retailer'];
export const EVENT_TYPES = ['Harvest', 'Processing', 'Quality Check', 'Packaging', 'Shipment', 'Distribution'];
