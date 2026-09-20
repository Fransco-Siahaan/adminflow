import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request interceptor: otomatis attach token JWT ke setiap request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: handle 401 (token expired / invalid).
 * Auto logout & redirect ke /login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Jangan redirect kalau sudah di halaman auth
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        localStorage.removeItem('adminflow_token');
        localStorage.removeItem('adminflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper untuk extract error message dari response backend.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Terjadi kesalahan';
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan';
}

/**
 * Helper untuk extract validation errors (Zod field errors).
 */
export function getFieldErrors(error: unknown): Record<string, string[]> | null {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.errors || null;
  }
  return null;
}