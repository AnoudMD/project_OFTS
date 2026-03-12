import client from './client';
export const createBatchApi = async (formData) => {
const { data } = await client.post('/batches', formData, {
headers: { 'Content-Type': 'multipart/form-data' },
});
return data;
};
export const getAllBatchesApi = async () => {
const { data } = await client.get('/batches');
return data;
};
export const reviewBatchApi = async (batchId, payload) => {
const { data } = await client.patch(`/batches/${batchId}/review`, payload);
return data;
};
export const addSupplyChainEventApi = async (payload) => {
const { data } = await client.post('/events', payload);
return data;
};