/**
 * RoleGuard
 * ─────────
 * Enforces role-based access control on a route segment.
 * Renders children only if the authenticated user's role is in `allowedRoles`.
 * Otherwise redirects to /unauthorized.
 *
 * Usage (inside a Next.js layout.tsx):
 *   <RoleGuard allowedRoles={['STUDENT']}>
 *     {children}
 *   </RoleGuard>
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthProvider';
import type { UserRole } from '@/services/authService';
import { BrainCircuit, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, router]);

  // While loading or before redirect fires, show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200">
          <BrainCircuit size={26} className="text-white" />
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Loader2 size={11} className="animate-spin" /> Checking permissions…
        </p>
      </div>
    );
  }

  // Not authenticated or wrong role — show nothing while redirect fires
  if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
