const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const FALLBACK_BASE_URL = 'http://localhost:5001';

const normalizedBaseUrl = (RAW_API_BASE_URL || FALLBACK_BASE_URL).replace(/\/+$/, '');

export const API_BASE_URL = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

export const ROLES = ['Producer', 'Certifier', 'Distributor', 'Retailer'];
export const EVENT_TYPES = ['Harvest', 'Processing', 'Quality Check',
'Packaging', 'Shipment', 'Distribution'];