/**
 * AuthProvider — Global Authentication Context
 * ────────────────────────────────────────────
 * Wraps the entire app. Provides:
 *  - Current authenticated user + role + permissions
 *  - login(), logout(), refreshSession()
 *  - isAuthenticated, isLoading
 *  - hasPermission(permission) helper
 *
 * Session is restored from storage on mount (survives page refresh).
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  authService,
  tokenStorage,
  type AuthUser,
  type UserRole,
  type LoginResponse,
} from '@/services/authService';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: (redirect?: boolean) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  canAccessPath: (path: string) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRestored = useRef(false);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    const restore = async () => {
      try {
        const restoredUser = await authService.restoreSession();
        if (restoredUser) {
          setUser(restoredUser);
        }
      } catch {
        // No valid session
        tokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, rememberMe = false): Promise<LoginResponse> => {
      const response = await authService.login(email, password, rememberMe);
      setUser(response.user);
      return response;
    },
    []
  );

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(
    async (redirect = true) => {
      await authService.logout();
      setUser(null);
      if (redirect) {
        router.push('/login');
      }
    },
    [router]
  );

  // ── Silent Token Refresh ────────────────────────────────────────────────────
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const newToken = await authService.refreshToken();
    if (!newToken) {
      setUser(null);
      return false;
    }
    return true;
  }, []);

  // ── Permission Helpers ──────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const canAccessPath = useCallback(
    (path: string): boolean => {
      if (!user) return false;
      return authService.canAccess(user.role, path);
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    permissions: user?.permissions ?? [],
    login,
    logout,
    refreshSession,
    hasPermission,
    canAccessPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

export { AuthContext };
