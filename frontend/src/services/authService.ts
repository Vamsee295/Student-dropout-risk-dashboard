/**
 * Authentication Service
 * ───────────────
 * Handles API calls for login, logout, and token persistence.
 */

import apiClient from '@/api/axios';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'DEAN';

export interface AuthUser {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEYS = {
  ACCESS: 'edurisk_access',
  REFRESH: 'edurisk_refresh',
  USER: 'edurisk_user',
  REMEMBER: 'edurisk_remember',
  RETURN_URL: 'edurisk_return_url',
};

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEYS.ACCESS) || localStorage.getItem(TOKEN_KEYS.ACCESS);
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  },
  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(TOKEN_KEYS.USER) || localStorage.getItem(TOKEN_KEYS.USER);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setTokens: (accessToken: string, refreshToken: string, user: AuthUser, remember: boolean) => {
    if (typeof window === 'undefined') return;
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEYS.ACCESS, accessToken);
    store.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    if (remember) localStorage.setItem(TOKEN_KEYS.REMEMBER, 'true');
  },
  clearAll: () => {
    if (typeof window === 'undefined') return;
    Object.values(TOKEN_KEYS).forEach((k) => {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    });
  },
  setReturnUrl: (url: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEYS.RETURN_URL, url);
  },
  getReturnUrl: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEYS.RETURN_URL);
  },
  clearReturnUrl: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEYS.RETURN_URL);
  },
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {

  async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const formData = new URLSearchParams();
      formData.append('username', cleanEmail);
      formData.append('password', password);

      const { data } = await apiClient.post<LoginResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      tokenStorage.setTokens(data.access_token, data.refresh_token, data.user, rememberMe);
      return data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
      throw new Error("Invalid credentials or server unavailable.");
    }
  },

  async refreshToken(): Promise<string | null> {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return null;

    try {
      const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refresh_token: refresh,
      });
      const remember = localStorage.getItem(TOKEN_KEYS.REMEMBER) === 'true';
      const store = remember ? localStorage : sessionStorage;
      store.setItem(TOKEN_KEYS.ACCESS, data.access_token);
      return data.access_token;
    } catch {
      return null;
    }
  },

  async restoreSession(): Promise<AuthUser | null> {
    const token = tokenStorage.getAccess();
    if (!token) return null;

    try {
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      return data;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const refresh = tokenStorage.getRefresh();
      await apiClient.post('/auth/logout', { refresh_token: refresh });
    } catch {
      // Best-effort
    } finally {
      tokenStorage.clearAll();
    }
  },

  getDashboardPath(role: UserRole): string {
    switch (role) {
      case 'STUDENT':  return '/student/dashboard';
      case 'FACULTY':
      case 'ADMIN':    return '/faculty/dashboard';
      case 'DEAN':     return '/dean/dashboard';
      default:         return '/login';
    }
  },

  getAllowedPrefixes(role: UserRole): string[] {
    switch (role) {
      case 'STUDENT':  return ['/student'];
      case 'FACULTY':  return ['/faculty'];
      case 'ADMIN':    return ['/faculty', '/dean'];
      case 'DEAN':     return ['/dean'];
      default:         return [];
    }
  },

  canAccess(role: UserRole, path: string): boolean {
    return this.getAllowedPrefixes(role).some((prefix) => path.startsWith(prefix));
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const { data } = await apiClient.post('/auth/forgot-password', { email: cleanEmail });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
    return data;
  },
};
