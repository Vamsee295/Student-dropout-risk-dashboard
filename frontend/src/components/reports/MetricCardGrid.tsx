"use client";

import { AlertTriangle, TrendingDown, Calendar, FileWarning, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

export function MetricCardGrid() {
    const [metrics, setMetrics] = useState<{
        loginGap: number;
        gradeTrend: number;
        attendance: number;
        missedAssignments: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/analytics/overview')
            .then(res => {
                const d = res.data;
                setMetrics({
                    loginGap: Math.round(100 - (d.average_attendance || 80)),
                    gradeTrend: -Math.round(d.average_risk_score * 0.2),
                    attendance: Math.round(d.average_attendance || 0),
                    missedAssignments: d.high_risk_count || 0,
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || !metrics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-center h-28">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                    </div>
                ))}
            </div>
        );
    }

    const loginStatus = metrics.loginGap > 20 ? "Inactive" : "Active";
    const loginDesc = metrics.loginGap > 20 ? `${metrics.loginGap}% below target` : "Within normal range";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-l-4 border-l-orange-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">LMS Activity</span>
                    <div className="p-1.5 rounded-full bg-orange-100 text-orange-600"><AlertTriangle size={14} /></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{loginStatus}</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">{loginDesc}</p>
            </div>

            <div className="rounded-xl border border-l-4 border-l-red-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Grade Trend</span>
                    <div className="p-1.5 rounded-full bg-red-100 text-red-600"><TrendingDown size={14} /></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{metrics.gradeTrend}% Avg</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Risk-adjusted trend</p>
            </div>

            <div className="rounded-xl border border-l-4 border-l-yellow-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Attendance</span>
                    <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600"><Calendar size={14} /></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{metrics.attendance}% Rate</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">{metrics.attendance < 75 ? "Below 75% threshold" : "Above threshold"}</p>
            </div>

            <div className="rounded-xl border border-l-4 border-l-blue-400 border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">High Risk</span>
                    <div className="p-1.5 rounded-full bg-blue-100 text-blue-600"><FileWarning size={14} /></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{metrics.missedAssignments} Students</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Flagged for intervention</p>
            </div>
        </div>
    );
}
