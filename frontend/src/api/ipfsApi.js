import client from './client';

export async function uploadCertificateToIpfsApi(certificateId) {
  const response = await client.post(`/ipfs/upload-certificate/${certificateId}`);
  return response.data;
}