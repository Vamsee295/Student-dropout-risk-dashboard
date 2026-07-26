"use client";

import Link from "next/link";
import { Clock, RefreshCw, BrainCircuit } from "lucide-react";
import { tokenStorage } from "@/services/authService";

export default function SessionExpiredPage() {
  const handleSignInAgain = () => {
    tokenStorage.clearAll();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-200">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">EduRisk <span className="text-cyan-600">AI</span></span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-100">
          <Clock size={40} className="text-amber-500" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-4 border border-amber-200">
          Session Expired
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Your session has ended
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          For your security, you were automatically signed out after a period of inactivity.
          Please sign in again to continue where you left off.
        </p>

        {/* Info card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm mb-8">
          <p className="text-xs font-bold text-slate-700 mb-3">🔒 Why did this happen?</p>
          <ul className="space-y-2">
            {[
              "Your access token expired after 1 hour",
              "Session refresh was not available",
              "This protects your account from unauthorized access",
            ].map((reason, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <button
          onClick={handleSignInAgain}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-bold rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md shadow-cyan-200 mb-3"
        >
          <RefreshCw size={16} /> Sign In Again
        </button>

        <Link
          href="/"
          className="block text-center text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
