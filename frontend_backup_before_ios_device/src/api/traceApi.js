import client from './client';
export const getTraceabilityApi = async (batchId) => {
const { data } = await client.get(`/trace/${batchId}`);
return data;
};