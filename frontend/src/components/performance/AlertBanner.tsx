"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

export function AlertBanner() {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 shadow-sm">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900">Critical Attention Required</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-red-800">
                    <p>
                        <span className="font-bold">3 courses</span> have been identified with dropout risk levels
                        exceeding 20% deviation from the institutional average.
                        Review the "Red Flag" items below.
                    </p>
                </div>
            </div>
            <button className="group flex items-center gap-1 text-sm font-bold text-red-700 hover:text-red-900 mt-1">
                View Analysis
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    );
}
