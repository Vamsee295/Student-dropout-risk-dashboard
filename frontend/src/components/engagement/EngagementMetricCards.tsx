"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, CheckCircle, LogIn } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
            const response = await fetch(`${API_URL}/api/engagement/overview`);
            const result = await response.json();
            setData(result);
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
        <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            {metric.title}
                        </span>
                        {metric.trend >= 0 ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                                <TrendingUp size={14} />
                                {metric.trendLabel}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                                <TrendingDown size={14} />
                                {metric.trendLabel}
                            </span>
                        )}
                    </div>

                    <div className="mb-2 flex items-end gap-3">
                        <span className="text-4xl font-bold text-gray-900">{metric.value}</span>
                        <metric.icon className="mb-1 text-gray-400" size={24} />
                    </div>

                    <p className="text-xs text-gray-400">{metric.description}</p>
                </div>
            ))}
        </div>
    );
}
