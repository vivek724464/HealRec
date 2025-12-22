import axios from 'axios';

// Prefer Vite-provided env var, fall back to hardcoded URL
export const API_URL = import.meta.env.VITE_HEALREC_API_URL || 'http://localhost:5000/HealRec';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;