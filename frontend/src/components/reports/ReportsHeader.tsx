"use client";

import { Search, Download, Printer, Filter, ChevronDown } from "lucide-react";

export function ReportsHeader() {
    return (
        <div className="space-y-6 bg-white p-8 pb-4 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Global Placement Performance Report
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            ACADEMIC YEAR 2025-26
                        </span>
                        <span className="text-sm text-slate-500">
                            Comprehensive tracking for Class of 2026
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search student by name or roll..."
                            className="h-10 w-64 rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <button className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                        Bulk Mail
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                            Branch
                        </label>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            All Branches
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                            Eligibility
                        </label>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            All Students
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                            Batch Year
                        </label>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            2026
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-1 justify-end pb-0.5">
                        <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700">
                            <Filter size={14} />
                            More Filters
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                        <Printer size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
