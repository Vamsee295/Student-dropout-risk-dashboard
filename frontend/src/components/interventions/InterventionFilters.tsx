"use client";

import { Search, ChevronDown, Filter } from "lucide-react";

export function InterventionFilters() {
    return (
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search student..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 outline-none"
                />
            </div>

            {/* Dropdowns */}
            <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100">
                    All Grades
                    <ChevronDown size={14} className="text-gray-500" />
                </button>
            </div>

            <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100">
                    All Students
                    <ChevronDown size={14} className="text-gray-500" />
                </button>
            </div>

            {/* Risk Tags */}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 border border-transparent hover:border-red-200 transition-all flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> High Risk
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 border border-transparent hover:border-orange-200 transition-all">
                    Medium Risk
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 border border-transparent hover:border-green-200 transition-all">
                    Low Risk
                </button>
            </div>
        </div>
    );
}
