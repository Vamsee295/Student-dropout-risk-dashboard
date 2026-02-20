"use client";

import { TrendingDown, Users, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

interface PerformanceMetricsProps {
    department?: string;
}

export function PerformanceMetrics({ department = "All Departments" }: PerformanceMetricsProps) {
    const [institutionalAvg, setInstitutionalAvg] = useState(0);
    const [atRiskCount, setAtRiskCount] = useState(0);
    const [trend, setTrend] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [avgResp, studentsResp] = await Promise.all([
                    apiClient.get('/performance/institutional-avg'),
                    apiClient.get('/students/all')
                ]);

                const avgData = avgResp.data;
                const studentsData = studentsResp.data;

                const riskPct = avgData.avg_risk_percentage || 0;
                setInstitutionalAvg(riskPct);
                setTrend(avgData.trend || 0);

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
        fetchData();
    }, [department]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    const trendPositive = trend >= 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Institutional Avg Risk</span>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trendPositive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{institutionalAvg.toFixed(1)}%</span>
                </div>
                <div className="mt-3 mb-1 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, institutionalAvg)}%` }}></div>
                </div>
                <p className="text-xs text-gray-400">Ideally below 10%</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">At-Risk Students</span>
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                        <Users size={14} />
                        {atRiskCount}
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{atRiskCount}</span>
                </div>
                <div className="mt-4 flex -space-x-2">
                    {[...Array(Math.min(3, atRiskCount))].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold">
                            {String.fromCharCode(65 + i)}
                        </div>
                    ))}
                    {atRiskCount > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-gray-600">
                            +{atRiskCount - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
