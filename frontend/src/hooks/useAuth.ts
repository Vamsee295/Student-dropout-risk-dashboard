/**
 * useAuth — custom hook for authentication context.
 * Re-exports from AuthProvider for a cleaner import path.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
 */

export { useAuth } from '@/auth/AuthProvider';
