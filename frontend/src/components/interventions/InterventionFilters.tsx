"use client";

import { Search, ChevronDown } from "lucide-react";

export function InterventionFilters() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search student..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* Grade Dropdown */}
            <div className="relative min-w-[140px]">
                <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none">
                    <option>All Grades</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
            </div>

            {/* Risk Toggles */}
            <div className="flex items-center gap-2 overflow-x-auto">
                <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200">
                    All Students
                </button>
                <button className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 border border-red-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    High Risk
                </button>
                <button className="flex items-center gap-1.5 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 border border-orange-100">
                    Medium Risk
                </button>
                <button className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 border border-emerald-100">
                    Low Risk
                </button>
            </div>
        </div>
    );
}
