"use client";

import { useEffect, useState } from "react";
import { Gauge, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RiskData {
    aggregate_risk_score: number;
    aggregate_category: "Low" | "Medium" | "High";
    distribution: Record<string, { count: number; pct: number }>;
    total_students: number;
}

interface PerformanceRiskScoreProps {
    department?: string;
}

function RiskGauge({ score }: { score: number }) {
    // SVG arc gauge
    const radius = 70;
    const cx = 90, cy = 90;
    const startAngle = 210;   // degrees (left)
    const endAngle = 330;   // degrees span
    const valueAngle = startAngle - (score / 100) * endAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    // Background arc path
    const arcPath = (from: number, to: number, r: number) => {
        const x1 = cx + r * Math.cos(toRad(-from));
        const y1 = cy + r * Math.sin(toRad(-from));
        const x2 = cx + r * Math.cos(toRad(-to));
        const y2 = cy + r * Math.sin(toRad(-to));
        const large = Math.abs(from - to) > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${from > to ? 0 : 1} ${x2} ${y2}`;
    };

    const totalSpan = 240;   // degrees total arc
    const filledSpan = (score / 100) * totalSpan;

    const bgStart = startAngle;
    const bgEnd = startAngle - totalSpan;

    const fillStart = bgStart;
    const fillEnd = bgStart - filledSpan;

    const needleAngle = startAngle - filledSpan;
    const needleX = cx + (radius - 10) * Math.cos(toRad(-needleAngle));
    const needleY = cy + (radius - 10) * Math.sin(toRad(-needleAngle));

    const color = score >= 60 ? "#ef4444" : score >= 35 ? "#f59e0b" : "#10b981";

    return (
        <svg viewBox="0 0 180 140" className="w-full max-w-[220px] mx-auto">
            {/* Track */}
            <path d={arcPath(bgStart, bgEnd, radius)} fill="none" stroke="#f3f4f6" strokeWidth={14} strokeLinecap="round" />
            {/* Green / low zone */}
            <path d={arcPath(bgStart, bgStart - totalSpan * 0.35, radius)} fill="none" stroke="#d1fae5" strokeWidth={14} strokeLinecap="round" />
            {/* Yellow / danger zone */}
            <path d={arcPath(bgStart - totalSpan * 0.35, bgStart - totalSpan * 0.60, radius)} fill="none" stroke="#fef3c7" strokeWidth={14} strokeLinecap="round" />
            {/* Red / critical zone */}
            <path d={arcPath(bgStart - totalSpan * 0.60, bgEnd, radius)} fill="none" stroke="#fee2e2" strokeWidth={14} strokeLinecap="round" />
            {/* Filled value */}
            {filledSpan > 0 && (
                <path d={arcPath(fillStart, fillEnd, radius)} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
            )}
            {/* Needle dot */}
            <circle cx={needleX} cy={needleY} r={6} fill={color} />
            <circle cx={cx} cy={cy} r={5} fill="#e5e7eb" />
            {/* Labels */}
            <text x={cx - radius - 4} y={cy + 30} textAnchor="middle" fontSize={9} fill="#10b981" fontWeight="600">Low</text>
            <text x={cx} y={cy + radius + 18} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight="600">Medium</text>
            <text x={cx + radius + 4} y={cy + 30} textAnchor="middle" fontSize={9} fill="#ef4444" fontWeight="600">High</text>
        </svg>
    );
}

export function PerformanceRiskScore({ department = "All Departments" }: PerformanceRiskScoreProps) {
    const [data, setData] = useState<RiskData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        fetch(`${API_URL}/api/performance/risk-scores${params}`)
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-56 rounded-2xl bg-gray-100 animate-pulse" />;
    if (!data) return null;

    const catConfig = {
        Low: { icon: <CheckCircle size={16} className="text-emerald-500" />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        Medium: { icon: <AlertTriangle size={16} className="text-yellow-500" />, cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        High: { icon: <Shield size={16} className="text-red-500" />, cls: "bg-red-50 text-red-700 border-red-200" },
    }[data.aggregate_category] ?? { icon: null, cls: "" };

    const distEntries = Object.entries(data.distribution);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Gauge size={18} className="text-indigo-500" />
                <h3 className="text-base font-bold text-gray-900">Performance Risk Score</h3>
            </div>

            <RiskGauge score={data.aggregate_risk_score} />

            <div className="mt-3 text-center">
                <p className="text-3xl font-extrabold text-gray-900">{data.aggregate_risk_score}</p>
                <p className="text-sm text-gray-500 mb-3">out of 100</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${catConfig.cls}`}>
                    {catConfig.icon}
                    {data.aggregate_category} Risk
                </span>
            </div>

            {/* Distribution */}
            <div className="mt-5 space-y-2">
                {distEntries.map(([cat, val]) => {
                    const colors: Record<string, string> = { Low: "bg-emerald-500", Medium: "bg-yellow-500", High: "bg-red-500" };
                    return (
                        <div key={cat}>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{cat}</span>
                                <span>{val.count} students ({val.pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className={`h-full rounded-full ${colors[cat] || "bg-gray-400"}`} style={{ width: `${val.pct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
                Formula: 0.4×GPA Decline + 0.3×Failed Subjects + 0.2×Attendance + 0.1×Assignment
            </p>
        </div>
    );
}
