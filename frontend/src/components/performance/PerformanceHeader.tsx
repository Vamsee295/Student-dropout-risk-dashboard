"use client";

import { Download, Calendar, ChevronDown } from "lucide-react";

export function PerformanceHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Course & Subject Performance
                </h1>
                <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                    Analyze dropout risks and attendance trends across all academic departments.
                    Identify red flag courses needing immediate intervention.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md">
                        <Calendar size={14} className="text-gray-500" />
                        Fall 2023
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md">
                        Dept: All Departments
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                </div>

                <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
                    <Download size={16} />
                    Export Report
                </button>
            </div>
        </div>
    );
}
