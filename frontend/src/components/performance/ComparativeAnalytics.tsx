"use client";

import { useEffect, useState } from "react";
import { Users, TrendingDown, TrendingUp, BarChart2 } from "lucide-react";
import apiClient from "@/lib/api";

interface CompData {
    class_avg_gpa: number;
    at_risk_avg_gpa: number;
    rank_percentile: number;
    at_risk_count: number;
    total_students: number;
    pattern_similarity_score: number;
}

interface ComparativeAnalyticsProps {
    department?: string;
}

export function ComparativeAnalytics({ department = "All Departments" }: ComparativeAnalyticsProps) {
    const [data, setData] = useState<CompData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        apiClient.get(`/performance/comparative${params}`)
            .then(r => r.data)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />;
    if (!data) return null;

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={18} className="text-indigo-500" />
                <h3 className="text-base font-bold text-gray-900">Comparative Analytics</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {/* Student vs Class */}
                <div className="rounded-xl bg-indigo-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-indigo-500" />
                        <p className="text-xs font-semibold text-indigo-700">Cohort vs Class Average</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-extrabold text-indigo-700">{data.class_avg_gpa.toFixed(2)}</p>
                        <p className="text-sm text-indigo-400">GPA</p>
                    </div>
                    <p className="text-xs text-indigo-500 mt-1">Rank Percentile: <span className="font-bold">{data.rank_percentile.toFixed(0)}th</span></p>

                    {/* Visual bar comparison */}
                    <div className="mt-3 space-y-1.5">
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                                <span>Cohort GPA</span>
                                <span>{data.class_avg_gpa.toFixed(2)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
                                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(data.class_avg_gpa / 4) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                                <span>At-Risk Avg</span>
                                <span>{data.at_risk_avg_gpa.toFixed(2)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-red-100 overflow-hidden">
                                <div className="h-full rounded-full bg-red-400" style={{ width: `${(data.at_risk_avg_gpa / 4) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* At-Risk Comparison */}
                <div className="rounded-xl bg-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={14} className="text-orange-500" />
                        <p className="text-xs font-semibold text-orange-700">At-Risk Group Comparison</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-extrabold text-orange-600">{data.at_risk_count}</p>
                        <p className="text-sm text-orange-400">/ {data.total_students} students</p>
                    </div>
                    <p className="text-xs text-orange-500 mt-1">
                        Pattern similarity: <span className="font-bold">{data.pattern_similarity_score.toFixed(1)}%</span> match to dropout cohort
                    </p>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Similarity Score</span>
                            <span>{data.pattern_similarity_score.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-orange-500 transition-all duration-700"
                                style={{ width: `${data.pattern_similarity_score}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            {data.pattern_similarity_score < 25
                                ? "Low similarity to historical dropout patterns."
                                : data.pattern_similarity_score < 50
                                    ? "Moderate behavioral overlap detected."
                                    : "High overlap with at-risk dropout patterns — action needed."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
