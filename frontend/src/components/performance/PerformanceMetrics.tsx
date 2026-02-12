"use client";

import { TrendingDown, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PerformanceMetricsProps {
    department?: string;
}

export function PerformanceMetrics({ department = "All Departments" }: PerformanceMetricsProps) {
    const [institutionalAvg, setInstitutionalAvg] = useState(12.4);
    const [atRiskCount, setAtRiskCount] = useState(145);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [department]);

    const fetchData = async () => {
        try {
            const [avgResp, studentsResp] = await Promise.all([
                fetch(`${API_URL}/api/performance/institutional-avg`),
                fetch(`${API_URL}/api/students/all`)
            ]);

            const avgData = await avgResp.json();
            const studentsData = await studentsResp.json();

            setInstitutionalAvg(avgData.avg_risk_percentage || 12.4);

            // Count at-risk students (high + moderate)
            const atRisk = studentsData.filter((s: any) =>
                s.risk_level === "High Risk" || s.risk_level === "Moderate Risk"
            ).length;
            setAtRiskCount(atRisk);
        } catch (error) {
            console.error("Error fetching performance metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading...</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {/* Institutional Avg Risk */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Institutional Avg Risk</span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                        <TrendingDown size={14} />
                        -1.2%
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{institutionalAvg.toFixed(1)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 mb-1 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${institutionalAvg}%` }}></div>
                </div>
                <p className="text-xs text-gray-400">Ideally below 10%</p>
            </div>

            {/* At-Risk Students */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">At-Risk Students</span>
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                        <TrendingUp size={14} />
                        +5
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{atRiskCount}</span>
                </div>

                {/* Avatars */}
                <div className="mt-4 flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}`} alt="avatar" />
                        </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-gray-600">
                        +{atRiskCount - 3}
                    </div>
                </div>
            </div>
        </div>
    );
}
