"use client";

import { AlertTriangle, TrendingDown, Calendar, FileWarning } from "lucide-react";

export function MetricCardGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LMS Activity */}
            <div className="rounded-xl border border-l-4 border-l-orange-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">LMS Activity</span>
                    <div className="p-1.5 rounded-full bg-orange-100 text-orange-600">
                        <AlertTriangle size={14} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Inactive</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">No login for 5 days</p>
            </div>

            {/* Grade Trend */}
            <div className="rounded-xl border border-l-4 border-l-red-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Grade Trend</span>
                    <div className="p-1.5 rounded-full bg-red-100 text-red-600">
                        <TrendingDown size={14} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">-15% Drop</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Math 201 critical</p>
            </div>

            {/* Attendance */}
            <div className="rounded-xl border border-l-4 border-l-yellow-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Attendance</span>
                    <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600">
                        <Calendar size={14} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">65% Rate</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Below 75% threshold</p>
            </div>

            {/* Assignments */}
            <div className="rounded-xl border border-l-4 border-l-blue-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Assignments</span>
                    <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                        <FileWarning size={14} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">3 Missed</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Due within last 2 weeks</p>
            </div>
        </div>
    );
}
