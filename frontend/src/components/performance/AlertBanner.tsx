"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

export function AlertBanner() {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900">Critical Attention Required</h3>
                <p className="mt-1 text-sm text-red-700">
                    <span className="font-bold">3 courses</span> have been identified with dropout risk levels exceeding 20% deviation from the institutional average. Review the "Red Flag" items below.
                </p>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900">
                View Analysis <ArrowRight size={14} />
            </button>
        </div>
    );
}
