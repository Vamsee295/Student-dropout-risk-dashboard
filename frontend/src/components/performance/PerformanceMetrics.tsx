"use client";

import { TrendingDown, Users, TrendingUp } from "lucide-react";

export function PerformanceMetrics() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {/* Institutional Avg Risk */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Institutional Avg Risk</span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                        <TrendingDown size={14} />
                        -1.2%
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">12.4%</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 mb-1 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full w-[12.4%] rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-xs text-gray-400">Ideally below 10%</p>
            </div>

            {/* At-Risk Students */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">At-Risk Students</span>
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                        <TrendingUp size={14} />
                        +5
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">145</span>
                </div>

                {/* Avatars */}
                <div className="mt-4 flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}`} alt="avatar" />
                        </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-gray-600">
                        +142
                    </div>
                </div>
            </div>
        </div>
    );
}
