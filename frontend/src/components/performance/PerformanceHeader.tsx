"use client";

import { Download, Calendar, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PerformanceHeaderProps {
    selectedYear: string;
    onYearChange: (year: string) => void;
    selectedDept: string;
    onDeptChange: (dept: string) => void;
    onExport: () => void;
}

export function PerformanceHeader({
    selectedYear,
    onYearChange,
    selectedDept,
    onDeptChange,
    onExport
}: PerformanceHeaderProps) {
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(false);

    // Close dropdowns on click outside (simplified for now, can be improved with hooks)

    const years = [
        "2023 - 2024",
        "2024 - 2025",
        "2025 - 2026",
        "2026 - 2027"
    ];

    const departments = [
        "All Departments",
        "CSE",
        "CS IT",
        "AEROSPACE",
        "AI-DS",
        "AIML",
        "DATA SCIENCE"
    ];

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-2 relative z-20">
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
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm relative">

                    {/* Year Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsYearOpen(!isYearOpen); setIsDeptOpen(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                            <Calendar size={14} className="text-gray-500" />
                            {selectedYear.split(' - ')[0] || "Select Year"} {/* Show start year for compactness */}
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isYearOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isYearOpen && (
                            <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => { onYearChange(year); setIsYearOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedYear === year ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                    >
                                        {year}
                                        {selectedYear === year && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-5 bg-gray-200"></div>

                    {/* Department Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsDeptOpen(!isDeptOpen); setIsYearOpen(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                            Dept: {selectedDept === "All Departments" ? "All" : selectedDept}
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDeptOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDeptOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                                {departments.map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => { onDeptChange(dept); setIsDeptOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedDept === dept ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                    >
                                        {dept}
                                        {selectedDept === dept && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Download size={16} />
                    Export Report
                </button>
            </div>
        </div>
    );
}
