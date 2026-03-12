import client from './client';
export const loginApi = async (payload) => {
const { data } = await client.post('/auth/login', payload);
return data;
};