"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, BrainCircuit, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    // Note: We render error immediately if missing, but let's be safe
    return (
      <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="text-red-500 mx-auto mb-3" size={32} />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Invalid Link</h3>
        <p className="text-sm text-slate-500 mb-4">No reset token found in the URL.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-cyan-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={26} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Password Reset!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your password has been successfully updated. You will be redirected to the login page momentarily.
        </p>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-cyan-200"
        >
          Go to Login Now
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Create New Password</h1>
      <p className="text-slate-500 text-sm mb-8">
        Your new password must be different from previous used passwords.
      </p>

      {error && (
        <div className="mb-5 bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-200">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-cyan-200 disabled:opacity-70"
        >
          {isLoading
            ? <><Loader2 size={16} className="animate-spin" /> Resetting…</>
            : "Reset Password"
          }
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-200">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">EduRisk <span className="text-cyan-600">AI</span></span>
          </Link>
          <Link href="/login" className="text-xs text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1 font-medium">
            ← Back to Login
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-6 transition-colors">
            <ChevronLeft size={16} /> Back to Login
          </Link>

          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 flex items-center justify-center mb-6">
              <KeyRound size={24} className="text-cyan-600" />
            </div>

            <Suspense fallback={<div className="py-8 flex justify-center"><Loader2 className="animate-spin text-cyan-600" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
