import client from './client';

export const loginApi = async (payload) => {
  const { data } = await client.post('/auth/login', payload);
  return data;
};

export const registerApi = async (payload) => {
  const { data } = await client.post('/auth/register', payload);
  return data;
};