"use client";

import { useState } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

const data = [
    { name: "Jan", value: 25, riskLevel: "Low" },
    { name: "Feb", value: 35, riskLevel: "Low" },
    { name: "Mar", value: 68, riskLevel: "High", driver: "Consecutive Absences" },
    { name: "Apr", value: 45, riskLevel: "Medium" },
    { name: "May", value: 55, riskLevel: "Medium" },
    { name: "Jun", value: 72, riskLevel: "High" },
];

type TabOption = "Attendance" | "Engagement" | "Grades";

export function DropoutRiskTrend() {
    const [activeTab, setActiveTab] = useState<TabOption>("Attendance");

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Dropout Risk Trend</h3>
                    <p className="text-xs text-slate-500">
                        Correlation analysis of risk factors over time
                    </p>
                </div>
                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {(["Attendance", "Engagement", "Grades"] as TabOption[]).map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === tab
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                By {tab}
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const dataPoint = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-white shadow-xl">
                                            <div className="mb-1 flex items-center justify-between gap-4">
                                                <span className="text-xs font-bold text-slate-300">
                                                    {label} Stats
                                                </span>
                                                {dataPoint.riskLevel === "High" && (
                                                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                                                        High Risk
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm font-bold">
                                                Risk Score: {dataPoint.value}%
                                            </div>
                                            {dataPoint.driver && (
                                                <div className="mt-1 text-xs text-amber-400">
                                                    Primary Driver:
                                                    <br />
                                                    {dataPoint.driver}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            activeDot={{
                                r: 6,
                                strokeWidth: 4,
                                stroke: "#fff",
                                fill: "#3b82f6",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
