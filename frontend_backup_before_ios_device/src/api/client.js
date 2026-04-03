import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
const client = axios.create({
baseURL: API_BASE_URL,
timeout: 15000,
});
export const setAuthToken = (token) => {
if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
else delete client.defaults.headers.common.Authorization;
};
export default client;