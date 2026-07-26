"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Loader2, AlertCircle, CheckCircle2, BrainCircuit, ChevronLeft, KeyRound } from "lucide-react";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || "Unable to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 flex items-center justify-center mb-6">
              <KeyRound size={24} className="text-cyan-600" />
            </div>

            {!sent ? (
              <>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Forgot Password?</h1>
                <p className="text-slate-500 text-sm mb-8">
                  Enter your registered email address and we&apos;ll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-5 bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-200">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
                        placeholder="e.g. student@gmail.com"
                      />
                    </div>
                  </div>
                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-cyan-200 disabled:opacity-70"
                  >
                    {isLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                      : "Send Reset Link"
                    }
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={26} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Check Your Email</h2>
                <p className="text-slate-500 text-sm mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-bold text-slate-700">{email}</span>.
                  The link expires in 30 minutes.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 mb-6 text-left">
                  <p className="font-semibold text-slate-700 mb-1">Didn&apos;t receive it?</p>
                  <ul className="space-y-1">
                    <li>• Check your spam / junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• <button onClick={() => setSent(false)} className="text-cyan-600 font-semibold hover:underline">Try again</button></li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-cyan-200"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
