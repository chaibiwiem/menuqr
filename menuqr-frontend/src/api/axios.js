import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // Read from Zustand in-memory state to avoid cross-tab localStorage token contamination
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-logout on the login endpoint itself (wrong password returns 401)
      if (!url.includes('/auth/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403 && error.response?.data?.error === 'NO_RESTAURANT') {
      useAuthStore.getState().logout();
      window.location.href = '/login?error=no_restaurant';
    }
    return Promise.reject(error);
  }
);

export default api;
