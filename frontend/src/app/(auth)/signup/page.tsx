"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building } from "lucide-react";

export default function SignupPage() {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="mb-6">
                <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Request Access</h2>
                <p className="text-sm text-gray-500 mt-2">
                    EduRisk AI is an enterprise platform. Please contact your institution's administrator to request an account.
                </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Email Support</h4>
                        <p className="text-xs text-gray-500 mt-1">admin@klu.ac.in</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                        <Phone size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">IT Helpdesk</h4>
                        <p className="text-xs text-gray-500 mt-1">Contact your department administrator</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                        <Building size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Admin Office</h4>
                        <p className="text-xs text-gray-500 mt-1">Building A, Room 304</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                    Reference ID: <span className="font-mono text-gray-600">REQ-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}</span>
                </p>
            </div>
        </div>
    );
}
