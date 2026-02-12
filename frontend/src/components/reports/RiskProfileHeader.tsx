"use client";

import { Check, Mail, Phone } from "lucide-react";

export function RiskProfileHeader() {
    return (
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Student Info */}
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-neutral-200 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            <span className="text-2xl font-bold text-neutral-400">AJ</span>
                            {/* <img src="/path/to/avatar.jpg" alt="Alex Johnson" /> */}
                        </div>
                        <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white">
                            <Check size={16} strokeWidth={4} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">Alex Johnson</h1>
                            <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wide">High Risk</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-2">
                            ID: #99281 • B.S. Computer Science • Semester 4
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>alex.j@uni.edu</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={14} />
                                <span>(555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk Gauge */}
                <div className="flex items-center gap-6 rounded-xl bg-red-50 p-4 min-w-[300px]">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                        {/* Simple SVG Circular Progress */}
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path
                                className="text-red-200"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                            />
                            {/* Progress Circle */}
                            <path
                                className="text-red-500"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray="88, 100" // 88% progress
                                strokeWidth="3.5"
                            />
                        </svg>
                        <span className="absolute text-xl font-bold text-red-700">88%</span>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-red-700">Critical Risk Level</h3>
                        <p className="text-xs font-medium text-red-600/80 leading-relaxed">
                            Predicted dropout probability based on recent activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
