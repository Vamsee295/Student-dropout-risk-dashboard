"use client";

import { Search, ChevronDown, X } from "lucide-react";

export function DirectoryFilters() {
    return (
        <div className="space-y-6">
            {/* Search and Filters Row */}
            <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or Student ID..."
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button className="flex h-10 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            All Departments
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="relative">
                        <button className="flex h-10 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            All Risk Levels
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                    <button className="flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Risk Summary Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900">
                    All Students <span className="ml-1 text-gray-500">1,240</span>
                </button>
                <button className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700">
                    High Risk <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">42</span>
                </button>
                <button className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-amber-50 hover:text-amber-700">
                    Medium Risk <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">115</span>
                </button>
            </div>
        </div>
    );
}
