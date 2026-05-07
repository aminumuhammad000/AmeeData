import axios from 'axios';
import { getAdminApiUrl, getApiUrl } from '../config/api.config';

const BASE_URL = getAdminApiUrl();

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.config?.url}`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// General API instance for non-admin endpoints
const API_BASE = getApiUrl();

export const generalApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

generalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

generalApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
