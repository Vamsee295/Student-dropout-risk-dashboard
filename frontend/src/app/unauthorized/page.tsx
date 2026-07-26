"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldOff, ArrowLeft, Home, BrainCircuit } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { authService } from "@/services/authService";

export default function UnauthorizedPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const dashboardPath = role ? authService.getDashboardPath(role) : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/40 to-orange-50/30 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

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
      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 border border-red-200 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-100">
          <ShieldOff size={40} className="text-red-500" />
        </div>

        {/* Error Code */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4 border border-red-200">
          403 · Access Denied
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          You don&apos;t have permission
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed mb-2">
          {user
            ? <>You&apos;re logged in as <span className="font-bold text-slate-700">{user.name}</span> ({role}), but this page requires a different role.</>
            : "You don't have access to this page."}
        </p>

        {/* Role explanation */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm">
          <p className="text-xs font-bold text-slate-700 mb-3">🔐 Role-Based Access Control</p>
          <div className="space-y-2">
            {[
              { role: "Student", path: "/student/dashboard", icon: "🎓", color: "text-blue-600" },
              { role: "Faculty", path: "/faculty/dashboard", icon: "📚", color: "text-emerald-600" },
              { role: "Dean / Admin", path: "/dean/dashboard", icon: "👑", color: "text-violet-600" },
            ].map((r) => (
              <div key={r.role} className={`flex items-center justify-between text-xs ${role === r.role.split(" ")[0].toUpperCase() ? "font-bold" : ""}`}>
                <span className="text-slate-600 flex items-center gap-2">{r.icon} {r.role}</span>
                <span className="font-mono text-slate-400 text-[10px]">{r.path}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={15} /> Go Back
          </button>

          {user ? (
            <Link
              href={dashboardPath}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-md shadow-cyan-200"
            >
              <Home size={15} /> My Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-md shadow-cyan-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
