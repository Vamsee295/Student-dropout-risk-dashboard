"use client";

import { Search, ChevronDown } from "lucide-react";

interface DirectoryFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    departments: string[];
    selectedDept: string;
    onDeptChange: (dept: string) => void;
    riskLevels: string[];
    selectedRisk: string;
    onRiskChange: (risk: string) => void;
    onClear: () => void;
    counts: { all: number; high: number; moderate: number };
}

export function DirectoryFilters({
    searchQuery,
    onSearchChange,
    departments,
    selectedDept,
    onDeptChange,
    riskLevels,
    selectedRisk,
    onRiskChange,
    onClear,
    counts
}: DirectoryFiltersProps) {
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
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedDept}
                            onChange={(e) => onDeptChange(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            className="h-10 appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedRisk}
                            onChange={(e) => onRiskChange(e.target.value)}
                        >
                            <option value="">All Risk Levels</option>
                            {riskLevels.map(risk => (
                                <option key={risk} value={risk}>{risk}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={onClear}
                        className="flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Risk Summary Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <button
                    onClick={() => onRiskChange("")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${selectedRisk === "" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    All Students <span className="ml-1 text-gray-500">{counts.all}</span>
                </button>
                <button
                    onClick={() => onRiskChange("High Risk")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${selectedRisk === "High Risk" ? "bg-red-50 text-red-700" : "text-gray-500 hover:bg-red-50 hover:text-red-700"}`}
                >
                    High Risk <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">{counts.high}</span>
                </button>
                <button
                    onClick={() => onRiskChange("Moderate Risk")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${selectedRisk === "Moderate Risk" ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"}`}
                >
                    Moderate Risk <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">{counts.moderate}</span>
                </button>
            </div>
        </div>
    );
}
