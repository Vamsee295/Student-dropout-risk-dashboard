"use client";

import Link from "next/link";
import { ArrowRight, Mail, Lock, Loader2, AlertCircle, ArrowLeft, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState<"STUDENT" | "FACULTY" | null>(null);
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const login = useAuthStore((state) => state.login);

    const handleRoleSelect = (role: "STUDENT" | "FACULTY") => {
        setSelectedRole(role);
        setError("");
        setSuccess("");
        setFormData({
            email: "",
            password: ""
        });
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            await authService.forgotPassword(formData.email);
            setSuccess("If an account exists, a reset link has been sent.");
            setTimeout(() => {
                setIsForgotMode(false);
                setSuccess("");
            }, 3000);
        } catch (err: any) {
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

            // Verify role matches selected role (optional but good UI UX)
            if (data.role !== selectedRole) {
                // If backend returns a different role than selected, we could either allow it or block it. 
                // For now, let's warn if strictly testing, but usually token dictates role.
                // Actually, let's just trust the backend token. The UI role selection was mainly for context.
            }

            const user = {
                id: data.user_id,
                email: formData.email,
                name: data.role === "STUDENT" ? "Ravi Student" : "Faculty Admin", // In real app, name comes from backend
                role: data.role,
                student_id: data.student_id
            };

            login(user, data.access_token);

            if (data.role === "STUDENT") {
                router.push("/student-dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full transition-all duration-300">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">EduRisk AI Portal</h2>
                <p className="text-sm text-gray-500 mt-2">
                    {isForgotMode
                        ? "Reset your password"
                        : selectedRole
                            ? `Login as ${selectedRole === 'STUDENT' ? 'Student' : 'Faculty'}`
                            : "Select your role to login"}
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <Loader2 size={16} className="animate-spin" /> {/* Or a checkmark */}
                    {success}
                </div>
            )}

            {!selectedRole && !isForgotMode ? (
                /* Role Selection View */
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button
                        onClick={() => handleRoleSelect("STUDENT")}
                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-200 transition-all group active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <span className="font-bold">Student</span>
                        <span className="text-xs text-blue-600/70 mt-1">View personal dashboard</span>
                    </button>

                    <button
                        onClick={() => handleRoleSelect("FACULTY")}
                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-purple-50 text-purple-900 hover:bg-purple-100 hover:border-purple-200 transition-all group active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">👨‍🏫</span>
                        </div>
                        <span className="font-bold">Teacher</span>
                        <span className="text-xs text-purple-600/70 mt-1">Access admin console</span>
                    </button>
                </div>
            ) : isForgotMode ? (
                /* Forgot Password View */
                <form onSubmit={handleForgotPassword} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                placeholder="name@university.edu"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsForgotMode(false)}
                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium py-2 flex items-center justify-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={14} /> Back to login
                    </button>
                </form>
            ) : (
                /* Login Form View */
                <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    placeholder="name@university.edu"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 ml-1">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotMode(true)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${selectedRole === 'STUDENT'
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Login as {selectedRole === 'STUDENT' ? 'Student' : 'Faculty'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSelectedRole(null)}
                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium py-2 flex items-center justify-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={14} /> Back to role selection
                    </button>
                </form>
            )}

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Test Credentials: <br />
                    <span className="font-mono bg-gray-50 px-1 py-0.5 rounded">student@klu.ac.in</span> | <span className="font-mono bg-gray-50 px-1 py-0.5 rounded">faculty@klu.ac.in</span>
                    <br />password: <span className="font-mono bg-gray-50 px-1 py-0.5 rounded">student123</span> | <span className="font-mono bg-gray-50 px-1 py-0.5 rounded">faculty123</span>
                </p>
            </div>
        </div>
    );
}
