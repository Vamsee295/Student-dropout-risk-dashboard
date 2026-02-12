"use client";

import Link from "next/link";
import { ArrowLeft, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSent(true);
    };

    if (isSent) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
                <p className="text-sm text-gray-500 mt-2 mb-8">
                    We have sent password recovery instructions to your email address.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="mb-8">
                <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4">
                    <ArrowLeft size={16} /> Back
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-2">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="name@university.edu"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            Send Instructions <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
