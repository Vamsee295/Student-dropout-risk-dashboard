"use client";

import { LogIn, Clock, FileCheck } from "lucide-react";

export function EngagementMetricCards() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Login Rate */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Avg. Login Rate</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">84%</span>
                        <span className="text-xs font-bold text-emerald-600">↗ 5%</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-400">Vs. previous 30 days</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-100">
                    <LogIn size={64} strokeWidth={1.5} />
                </div>
            </div>

            {/* Time Spent */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Avg. Time Spent</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">4.2h</span>
                        <span className="text-xs font-bold text-emerald-600">↗ 1.2h</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-400">Per student / week</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-100">
                    <Clock size={64} strokeWidth={1.5} />
                </div>
            </div>

            {/* Assignment Completion */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Assignment Completion</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">92%</span>
                        <span className="text-xs font-bold text-emerald-600">↗ 3%</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-400">Total submissions rate</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-100">
                    <FileCheck size={64} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
