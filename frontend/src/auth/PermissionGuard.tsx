/**
 * PermissionGuard
 * ───────────────
 * Granular permission check for individual UI elements.
 * Hides children if the user lacks the required permission.
 *
 * Usage:
 *   <PermissionGuard permission="create:interventions">
 *     <InterventionButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="manage:grades" fallback={<ReadOnlyView />}>
 *     <GradeEditor />
 *   </PermissionGuard>
 */

'use client';

import { useAuth } from '@/auth/AuthProvider';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) return null;

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

/**
 * usePermission — inline permission check hook.
 * Usage: const canManageGrades = usePermission('manage:grades');
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}
