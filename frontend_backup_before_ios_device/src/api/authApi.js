import client from './client';
import { API_BASE_URL } from '../utils/constants';

export const loginApi = async (payload) => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const baseWithoutApi = normalizedBase.replace(/\/api$/, '');
  const baseWithApi = normalizedBase.endsWith('/api')
    ? normalizedBase
    : `${normalizedBase}/api`;

  const primaryUrl = `${normalizedBase}/auth/login`;
  const fallbackUrl = normalizedBase.endsWith('/api')
    ? `${baseWithoutApi}/auth/login`
    : `${baseWithApi}/auth/login`;

  try {
    const { data } = await client.post(primaryUrl, payload);
    return data;
  } catch (error) {
    if (error?.response?.status !== 404 || fallbackUrl === primaryUrl) {
      throw error;
    }

    const { data } = await client.post(fallbackUrl, payload);
    return data;
  }
};

export const registerApi = async (payload) => {
  const { data } = await client.post('/auth/register', payload);
  return data;
};
