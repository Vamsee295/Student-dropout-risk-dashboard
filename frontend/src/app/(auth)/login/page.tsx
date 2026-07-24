"use client";

import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ChevronLeft, GraduationCap, BookOpen, Crown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth";
import { Logo } from "@/components/Logo";

type RoleType = "STUDENT" | "FACULTY" | "DEAN";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    const login = useAuthStore((state) => state.login);

    const handleRoleSelect = (role: RoleType) => {
        setSelectedRole(role);
        setError("");
        setSuccess("");
        setFormData({ email: "", password: "" });
    };

    const handleBackToChoice = () => {
        setSelectedRole(null);
        setIsForgotMode(false);
        setError("");
        setSuccess("");
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            await authService.forgotPassword(formData.email);
            setSuccess("If an account exists, a reset link has been sent.");
            setTimeout(() => { setIsForgotMode(false); setSuccess(""); }, 3000);
        } catch {
            setError("Failed to process reset request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const data = await authService.login(formData.email, formData.password);
            const user = {
                id: data.user_id as number,
                email: formData.email,
                name: data.name || formData.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                role: data.role as "STUDENT" | "DEAN" | "FACULTY" | "ADMIN",
                student_id: data.student_id
            };
            login(user as any, data.access_token);
            if (data.role === "STUDENT") {
                router.push("/student/dashboard");
            } else if (data.role === "DEAN") {
                router.push("/dean/dashboard");
            } else {
                router.push("/faculty/dashboard");
            }
        } catch (err: unknown) {
            const detail = err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response
                ? (err.response as { data?: { detail?: string } }).data?.detail
                : undefined;
            setError(detail || "Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const cardBase = "relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5";
    const shineClass = "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent";

    // Login form UI (reused for all roles)
    const renderLoginForm = (role: RoleType) => (
        <div className="text-left animate-in fade-in duration-200">
            <button type="button" onClick={handleBackToChoice} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-6">
                <ChevronLeft size={16} /> Back
            </button>
            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div className="mb-4 bg-gray-50 text-gray-800 p-3 rounded-lg text-sm border border-gray-200">{success}</div>
            )}
            {isForgotMode ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="name@institution.edu" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors ${role === "DEAN" ? "bg-violet-700 hover:bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                    </button>
                    <button type="button" onClick={() => setIsForgotMode(false)} className="text-sm text-gray-500 hover:text-gray-700 w-full">Back to login</button>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="name@institution.edu" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-semibold text-gray-600 hover:text-gray-800">
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="password" required value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="••••••••" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors ${role === "DEAN" ? "bg-violet-700 hover:bg-violet-600" : "bg-gray-800 hover:bg-gray-700"}`}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                    </button>
                </form>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col relative bg-gray-100">
            <header className="relative z-10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo variant="light" />
                    </Link>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">

                    {/* Card 1 — Faculty */}
                    <div className={`${cardBase} p-8`}>
                        <div className={shineClass} />
                        <div className="relative z-10 w-full text-center">
                            {!selectedRole || selectedRole === "FACULTY" ? (
                                selectedRole === "FACULTY" ? (
                                    renderLoginForm("FACULTY")
                                ) : (
                                    <>
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <BookOpen className="w-8 h-8 text-gray-600" />
                                            </div>
                                        </div>
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full mb-4">FACULTY</span>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">For Faculty</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                            Monitor at-risk students, upload data, and run reports.
                                        </p>
                                        <button type="button" onClick={() => handleRoleSelect("FACULTY")}
                                            className="w-full py-3 rounded-xl font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-300">
                                            Login
                                        </button>
                                        <p className="text-sm text-gray-500 mt-6">
                                            <Link href="/signup" className="font-semibold text-gray-700 hover:text-gray-900">Request access</Link>
                                        </p>
                                    </>
                                )
                            ) : (
                                <button type="button" onClick={() => handleRoleSelect("FACULTY")} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                                    Login as Faculty →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card 2 — Student */}
                    <div className={`${cardBase} p-8`}>
                        <div className={shineClass} />
                        <div className="relative z-10 w-full text-center">
                            {!selectedRole || selectedRole === "STUDENT" ? (
                                selectedRole === "STUDENT" ? (
                                    renderLoginForm("STUDENT")
                                ) : (
                                    <>
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <GraduationCap className="w-8 h-8 text-gray-600" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">For Students</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                            View your personal dashboard and track your progress.
                                        </p>
                                        <button type="button" onClick={() => handleRoleSelect("STUDENT")}
                                            className="w-full py-3 rounded-xl font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-300">
                                            Login
                                        </button>
                                        <p className="text-sm text-gray-500 mt-6">
                                            <Link href="/signup" className="font-semibold text-gray-700 hover:text-gray-900">Sign up</Link>
                                        </p>
                                    </>
                                )
                            ) : (
                                <button type="button" onClick={() => handleRoleSelect("STUDENT")} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                                    ← Login as Student
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card 3 — Dean / HOD */}
                    <div className={`${cardBase} p-8 border-violet-200`}>
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50/60 via-transparent to-transparent" />
                        <div className="relative z-10 w-full text-center">
                            {!selectedRole || selectedRole === "DEAN" ? (
                                selectedRole === "DEAN" ? (
                                    renderLoginForm("DEAN")
                                ) : (
                                    <>
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center border border-violet-200">
                                                <Crown className="w-8 h-8 text-violet-600" />
                                            </div>
                                        </div>
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-violet-700 bg-violet-100 rounded-full mb-4">DEAN / HOD</span>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Strategic View</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                            Department trends, faculty performance, and policy-level AI insights.
                                        </p>
                                        <button type="button" onClick={() => handleRoleSelect("DEAN")}
                                            className="w-full py-3 rounded-xl font-semibold text-white bg-violet-700 hover:bg-violet-600 transition-colors">
                                            Login as Dean
                                        </button>
                                    </>
                                )
                            ) : (
                                <button type="button" onClick={() => handleRoleSelect("DEAN")} className="text-sm font-semibold text-violet-600 hover:text-violet-800">
                                    ← Login as Dean
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <footer className="relative z-10 py-4 text-center">
                <p className="text-xs text-gray-500">
                    Test: <span className="font-mono bg-gray-200/80 px-1.5 py-0.5 rounded">student1@gmail.com</span> /&nbsp;
                    <span className="font-mono bg-gray-200/80 px-1.5 py-0.5 rounded">faculty1@gmail.com</span> /&nbsp;
                    <span className="font-mono bg-gray-200/80 px-1.5 py-0.5 rounded">dean1@gmail.com</span>&nbsp;
                    — password: <span className="font-mono bg-gray-200/80 px-1.5 py-0.5 rounded">EduRisk@2026</span>
                </p>
            </footer>
        </div>
    );
}
