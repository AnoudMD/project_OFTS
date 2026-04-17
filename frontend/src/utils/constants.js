import Constants from 'expo-constants';

function getApiBaseUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    '';

  const host = hostUri.split(':')[0];

  if (!host) {
    return 'http://localhost:5001/api';
  }

  return `http://${host}:5001/api`;
}

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || getApiBaseUrl()).replace(/\/+$/, '');

export const ROLES = ['Producer', 'Certifier', 'Distributor', 'Retailer'];

export const EVENT_TYPES = [
  'Harvest',
  'Processing',
  'Quality Check',
  'Packaging',
  'Shipment',
  'Distribution',
];