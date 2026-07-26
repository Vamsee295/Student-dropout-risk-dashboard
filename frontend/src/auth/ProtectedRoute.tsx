/**
 * ProtectedRoute
 * ──────────────
 * Ensures the user is authenticated before rendering children.
 * If not authenticated, redirects to /login with a returnUrl param
 * so the user is sent back after login.
 *
 * Shows a loading spinner while session is being restored.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <StudentDashboard />
 *   </ProtectedRoute>
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/auth/AuthProvider';
import { tokenStorage } from '@/services/authService';
import { BrainCircuit, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save current path so we can redirect back after login
      tokenStorage.setReturnUrl(pathname);
      router.replace(`/login`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen />; // Shows briefly while redirect kicks in
  }

  return <>{children}</>;
}

// ─── Auth Loading Screen ──────────────────────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200">
        <BrainCircuit size={26} className="text-white" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-900">EduRisk AI</p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
          <Loader2 size={11} className="animate-spin" /> Verifying your session…
        </p>
      </div>
    </div>
  );
}
