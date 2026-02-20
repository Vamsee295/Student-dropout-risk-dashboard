"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, CheckCircle, LogIn } from "lucide-react";

import apiClient from "@/lib/api";

interface EngagementOverview {
    avg_login_rate: number;
    login_rate_trend: number;
    avg_time_spent: number;
    time_spent_trend: number;
    assignment_completion: number;
    completion_trend: number;
}

export function EngagementMetricCards() {
    const [data, setData] = useState<EngagementOverview | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await apiClient.get('/engagement/overview');
            setData(response.data);
        } catch (error) {
            console.error("Error fetching engagement overview:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading metrics...</div>;
    }

    if (!data) {
        return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    const metrics = [
        {
            title: "AVG. LOGIN RATE",
            value: `${Math.round(data.avg_login_rate)}%`,
            trend: data.login_rate_trend,
            trendLabel: `${data.login_rate_trend > 0 ? '+' : ''}${data.login_rate_trend}%`,
            description: "Vs. previous 30 days",
            icon: LogIn,
            color: "blue"
        },
        {
            title: "AVG. TIME SPENT",
            value: `${data.avg_time_spent.toFixed(1)}h`,
            trend: data.time_spent_trend,
            trendLabel: `${data.time_spent_trend > 0 ? '+' : ''}${data.time_spent_trend.toFixed(1)}h`,
            description: "Per student / week",
            icon: Clock,
            color: "purple"
        },
        {
            title: "ASSIGNMENT COMPLETION",
            value: `${Math.round(data.assignment_completion)}%`,
            trend: data.completion_trend,
            trendLabel: `${data.completion_trend > 0 ? '+' : ''}${data.completion_trend}%`,
            description: "Total submissions rate",
            icon: CheckCircle,
            color: "green"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {metrics.map((metric, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-3 -translate-y-3 group-hover:scale-110 transition-transform`}>
                        <metric.icon size={100} className={metric.trend >= 0 ? "text-blue-600" : "text-gray-400"} />
                    </div>

                    <div className="relative z-10">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {metric.title}
                            </span>
                        </div>

                        <div className="mb-3 flex items-baseline gap-3">
                            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{metric.value}</span>

                            {metric.trend >= 0 ? (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                                    <TrendingUp size={12} />
                                    {metric.trendLabel}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                                    <TrendingDown size={12} />
                                    {metric.trendLabel}
                                </span>
                            )}
                        </div>

                        <p className="text-xs font-medium text-gray-400">{metric.description}</p>

                        {/* Mini progress bar decoration */}
                        <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${metric.trend >= 0 ? 'bg-blue-500' : 'bg-orange-400'}`}
                                style={{ width: `${i === 0 ? Math.round(data.avg_login_rate) : i === 1 ? Math.min(100, Math.round(data.avg_time_spent * 10)) : Math.round(data.assignment_completion)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
