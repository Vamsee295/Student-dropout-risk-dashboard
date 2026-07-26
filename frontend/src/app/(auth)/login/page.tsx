"use client";

import Link from "next/link";
import {
  Mail, Lock, Loader2, AlertCircle, ChevronLeft,
  GraduationCap, BookOpen, Crown, BrainCircuit, ArrowRight, Eye, EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthProvider";
import { authService, tokenStorage } from "@/services/authService";

type RoleType = "STUDENT" | "FACULTY" | "DEAN";

const roleConfig = {
  STUDENT: {
    email: "student@gmail.com",
    label: "Student Portal",
    badge: "STUDENT",
    desc: "Your personal AI-powered academic success assistant. Track performance, attendance, risk scores, and get personalized guidance.",
    icon: <GraduationCap size={28} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
    badgeCls: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    ring: "ring-blue-400",
    border: "hover:border-blue-300",
    accent: "from-blue-50",
    features: ["AI Dropout Risk Score", "Attendance Analytics", "Performance Charts", "AI Study Planner"],
    focusRing: "focus:ring-blue-500/20 focus:border-blue-500",
  },
  FACULTY: {
    email: "faculty@gmail.com",
    label: "Faculty Workspace",
    badge: "FACULTY",
    desc: "Monitor all your students in one place. Get AI alerts for at-risk students, conduct interventions, and generate reports.",
    icon: <BookOpen size={28} />,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    badgeCls: "bg-emerald-100 text-emerald-700",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    ring: "ring-emerald-400",
    border: "hover:border-emerald-300",
    accent: "from-emerald-50",
    features: ["At-Risk Roster", "Intervention Tracking", "Course Analytics", "AI Recommendations"],
    focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500",
  },
  DEAN: {
    email: "dean@gmail.com",
    label: "Executive Command",
    badge: "DEAN / ADMIN",
    desc: "Institutional intelligence at your fingertips. Department comparisons, AI forecasts, compliance tracking, and budget intelligence.",
    icon: <Crown size={28} />,
    iconBg: "bg-violet-50 text-violet-600 border-violet-200",
    badgeCls: "bg-violet-100 text-violet-700",
    btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-200",
    ring: "ring-violet-400",
    border: "hover:border-violet-300",
    accent: "from-violet-50",
    features: ["Institution Health Score", "AI Forecasting", "NAAC Compliance", "Policy Simulator"],
    focusRing: "focus:ring-violet-500/20 focus:border-violet-500",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setError("");
    setSuccessMsg("");
    setFormData({ email: roleConfig[role].email, password: "passwords" });
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError("");
    setSuccessMsg("");
    setFormData({ email: "", password: "" });
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await login(formData.email, formData.password, rememberMe);
      const userRole = response.user.role;

      // Validate role matches selected portal
      const roleMatches =
        (selectedRole === "FACULTY" && (userRole === "FACULTY" || userRole === "ADMIN")) ||
        (selectedRole === "STUDENT" && userRole === "STUDENT") ||
        (selectedRole === "DEAN" && (userRole === "DEAN" || userRole === "ADMIN"));

      if (!roleMatches) {
        setError(
          `Access Denied: This account belongs to a ${userRole} user. Please select the correct portal.`
        );
        setIsLoading(false);
        return;
      }

      setSuccessMsg("✓ Login successful! Redirecting…");

      // Redirect to returnUrl (if stored) or role dashboard
      const returnUrl = tokenStorage.getReturnUrl();
      tokenStorage.clearReturnUrl();
      const target = returnUrl || authService.getDashboardPath(userRole);
      router.push(target);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } }; message?: string };
      const detail = apiError?.response?.data?.detail || apiError?.message;
      setError(detail || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cfg = selectedRole ? roleConfig[selectedRole] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-200">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">EduRisk <span className="text-cyan-600">AI</span></span>
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-1 font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-10">
        {!selectedRole ? (
          /* ── Role Selection ── */
          <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 mb-3">Choose Your Portal</h1>
              <p className="text-slate-600 text-sm">Select your role to access your personalized EduRisk AI dashboard.</p>
              <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <span className="text-[10px] text-slate-500 font-medium">Demo credentials:</span>
                {(["STUDENT", "FACULTY", "DEAN"] as RoleType[]).map((r) => (
                  <span key={r} className="text-[10px] font-mono font-bold text-slate-700">
                    {roleConfig[r].email}
                  </span>
                ))}
                <span className="text-[10px] text-slate-500">
                  · password: <span className="font-mono font-bold text-slate-700">passwords</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["STUDENT", "FACULTY", "DEAN"] as RoleType[]).map((role) => {
                const c = roleConfig[role];
                return (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`cursor-pointer bg-white border border-slate-200 ${c.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-slate-200/50 group flex flex-col`}
                  >
                    <div className={`w-14 h-14 rounded-2xl border ${c.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform bg-white`}>
                      {c.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeCls} mb-3 inline-block`}>{c.badge}</span>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{c.label}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-6">{c.desc}</p>
                    </div>
                    <div className="mt-auto">
                      <ul className="space-y-2 mb-6">
                        {c.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <div className={`w-1.5 h-1.5 rounded-full ${c.iconBg.includes("blue") ? "bg-blue-500" : c.iconBg.includes("emerald") ? "bg-emerald-500" : "bg-violet-500"}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white ${c.btn} shadow-sm transition-all`}>
                        Enter {c.label} <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Login Form ── */
          <div className="w-full max-w-md">
            <button onClick={handleBack} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-6 transition-colors">
              <ChevronLeft size={16} /> Choose a different portal
            </button>

            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl p-8">
              {/* Role header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center bg-white ${cfg!.iconBg}`}>
                  {cfg!.icon}
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg!.badgeCls}`}>
                    {cfg!.badge}
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{cfg!.label}</p>
                </div>
              </div>

              {/* Error state */}
              {error && (
                <div className="mb-5 bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-200">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success state */}
              {successMsg && (
                <div className="mb-5 bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 ${cfg!.focusRing} transition-all shadow-sm`}
                      placeholder={cfg!.email}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <Link href="/forgot-password" className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 ${cfg!.focusRing} transition-all shadow-sm`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                    Remember me for 30 days
                  </span>
                </label>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg ${cfg!.btn} disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                      : <><span>Sign In to {cfg!.label}</span> <ArrowRight size={16} /></>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Demo hint */}
            <p className="text-center text-[11px] text-slate-500 mt-6 font-medium">
              Credentials pre-filled for demo · Password:{" "}
              <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded">passwords</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
