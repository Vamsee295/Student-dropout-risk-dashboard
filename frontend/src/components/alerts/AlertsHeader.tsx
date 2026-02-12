"use client";

import { Play, Calendar, Bell } from "lucide-react";

export function AlertsHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">ML Risk Analysis Insights</h1>
                <p className="text-sm text-slate-500">
                    Detailed breakdown of predictive model performance and key risk drivers for the current semester.
                </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors">
                <Play size={16} fill="currentColor" />
                Run New Analysis
            </button>
        </div>
    );
}
