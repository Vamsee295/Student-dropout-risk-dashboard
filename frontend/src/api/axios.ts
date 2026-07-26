/**
 * Centralized Axios Client
 * ─────────────────────────
 * - Attaches Bearer JWT to every request
 * - Silently refreshes the access token on 401 responses
 * - Redirects to /session-expired if refresh fails
 * - Adds request timeout
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/services/authService';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Track in-flight refresh to avoid parallel refresh storms ────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

// ─── Request Interceptor — Attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle 401, refresh token, then retry ─────────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap backend StandardResponse if present
    if (response.data && response.data.success !== undefined && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid retry loops
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Import here to avoid circular dependency at module load time
        const { authService } = await import('@/services/authService');
        const newToken = await authService.refreshToken();

        if (newToken) {
          onRefreshed(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          // Refresh failed — force logout
          tokenStorage.clearAll();
          if (typeof window !== 'undefined') {
            window.location.href = '/session-expired';
          }
          return Promise.reject(error);
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
