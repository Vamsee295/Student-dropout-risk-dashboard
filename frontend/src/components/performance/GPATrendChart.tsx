"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Minus, Activity } from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, Legend, Area, AreaChart, ComposedChart, Bar
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TrendsData {
    terms: string[];
    gpa_series: number[];
    rolling_avg: (number | null)[];
    drops: { term_index: number; from_gpa: number; to_gpa: number; drop: number }[];
    trend_direction: string;
    subject_grades: { subject: string; grade: number; passed: boolean; peer_avg: number }[];
}

interface GPATrendChartProps {
    department?: string;
}

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isDropPoint) {
        return <circle cx={cx} cy={cy} r={7} fill="#ef4444" stroke="white" strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={4} fill="#6366f1" stroke="white" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
            <p className="font-bold text-gray-800 mb-1">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-500">{p.name}:</span>
                    <span className="font-semibold text-gray-800">{typeof p.value === "number" ? p.value.toFixed(2) : "—"}</span>
                </div>
            ))}
            {payload[0]?.payload?.isDropPoint && (
                <p className="mt-1 text-xs text-red-600 font-semibold">⚠ Sharp drop detected!</p>
            )}
        </div>
    );
};

export function GPATrendChart({ department = "All Departments" }: GPATrendChartProps) {
    const [data, setData] = useState<TrendsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"gpa" | "subjects">("gpa");

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        fetch(`${API_URL}/api/performance/trends${params}`)
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-80 rounded-2xl bg-gray-100 animate-pulse" />;
    if (!data) return null;

    const dropIndices = new Set(data.drops.map(d => d.term_index));

    const chartData = data.terms.map((term, i) => ({
        term,
        GPA: data.gpa_series[i],
        "3-Term Avg": data.rolling_avg[i] ?? undefined,
        isDropPoint: dropIndices.has(i),
    }));

    const subjectData = data.subject_grades.map(s => ({
        subject: s.subject.length > 8 ? s.subject.slice(0, 8) + "…" : s.subject,
        fullName: s.subject,
        Grade: s.grade,
        "Peer Avg": s.peer_avg,
        failed: !s.passed,
    }));

    const trendIcon =
        data.trend_direction === "improving" ? <TrendingUp size={16} className="text-emerald-500" /> :
            data.trend_direction === "declining" ? <TrendingDown size={16} className="text-red-500" /> :
                <Minus size={16} className="text-yellow-500" />;

    const trendLabel =
        data.trend_direction === "improving" ? "Improving" :
            data.trend_direction === "declining" ? "Declining" : "Stable";

    const trendColor =
        data.trend_direction === "improving" ? "text-emerald-600 bg-emerald-50" :
            data.trend_direction === "declining" ? "text-red-600 bg-red-50" :
                "text-yellow-600 bg-yellow-50";

    const SubjectTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const item = data.subject_grades.find(s => s.subject.startsWith(label.replace("…", "")));
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm min-w-[160px]">
                <p className="font-bold text-gray-800 mb-1">{item?.subject || label}</p>
                {payload.map((p: any) => (
                    <div key={p.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: p.fill || p.color }} />
                        <span className="text-gray-500">{p.name}:</span>
                        <span className="font-semibold">{p.value}%</span>
                    </div>
                ))}
                {item && !item.passed && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">❌ Failed</p>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-5 pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Activity size={18} className="text-indigo-500" />
                        Performance Trend Analysis
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Term-wise GPA with rolling average and subject breakdown</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${trendColor}`}>
                        {trendIcon} {trendLabel}
                    </span>
                    {data.drops.length > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            ⚠ {data.drops.length} sharp drop{data.drops.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-4">
                {(["gpa", "subjects"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${activeTab === tab
                                ? "bg-indigo-600 text-white"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                    >
                        {tab === "gpa" ? "GPA Trend" : "Subject Grades"}
                    </button>
                ))}
            </div>

            <div className="p-5 pt-4">
                {activeTab === "gpa" ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                            <defs>
                                <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="term" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 4]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                            <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Min GPA", position: "right", fontSize: 10, fill: "#ef4444" }} />
                            <Area type="monotone" dataKey="GPA" fill="url(#gpaGrad)" stroke="transparent" />
                            <Line type="monotone" dataKey="GPA" stroke="#6366f1" strokeWidth={2.5} dot={<CustomDot />} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="3-Term Avg" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={subjectData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<SubjectTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Pass Mark", position: "right", fontSize: 10, fill: "#ef4444" }} />
                            <Bar dataKey="Grade" radius={[4, 4, 0, 0]}
                                fill="#6366f1"
                                maxBarSize={48}
                            />
                            <Line type="monotone" dataKey="Peer Avg" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Drop summaries */}
            {data.drops.length > 0 && activeTab === "gpa" && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-3 flex flex-wrap gap-2">
                    {data.drops.map((d, i) => (
                        <span key={i} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                            {data.terms[d.term_index]}: {d.from_gpa} → {d.to_gpa} (↓{d.drop})
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
