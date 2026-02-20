"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, TrendingDown, Shield } from "lucide-react";
import apiClient from "@/lib/api";

interface InsightData {
    insight: string;
    risk_score: number;
    risk_category: string;
}

interface AIInsightCardProps {
    department?: string;
}

export function AIInsightCard({ department = "All Departments" }: AIInsightCardProps) {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetch_ = () => {
        setLoading(true);
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        apiClient.get(`/performance/ai-insight${params}`)
            .then(r => r.data)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch_(); }, [department]);

    const catConfig = {
        High: { icon: <TrendingDown size={16} />, color: "text-red-600", bg: "from-red-50 to-orange-50 border-red-100" },
        Medium: { icon: <Shield size={16} />, color: "text-yellow-600", bg: "from-yellow-50 to-amber-50 border-yellow-100" },
        Low: { icon: <Sparkles size={16} />, color: "text-emerald-600", bg: "from-emerald-50 to-teal-50 border-emerald-100" },
    }[data?.risk_category || "Low"] ?? { icon: null, color: "", bg: "" };

    return (
        <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${catConfig.bg}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ${catConfig.color}`}>
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">AI Insight Summary</h3>
                        <p className="text-xs text-gray-400">Rule-based intelligence</p>
                    </div>
                </div>
                <button
                    onClick={fetch_}
                    disabled={loading}
                    className="flex items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="space-y-2">
                    <div className="h-4 bg-white/60 rounded animate-pulse w-full" />
                    <div className="h-4 bg-white/60 rounded animate-pulse w-4/5" />
                    <div className="h-4 bg-white/60 rounded animate-pulse w-3/5" />
                </div>
            ) : data ? (
                <>
                    <div className="rounded-xl bg-white/70 p-4 backdrop-blur-sm">
                        <p className="text-sm leading-relaxed text-gray-700 italic">
                            "{data.insight}"
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${catConfig.color}`}>
                            {catConfig.icon}
                            {data.risk_category} Risk
                        </span>
                        <span className="text-xs text-gray-400">· Score: {data.risk_score}/100</span>
                    </div>
                </>
            ) : (
                <p className="text-sm text-gray-400">No insight available.</p>
            )}
        </div>
    );
}
