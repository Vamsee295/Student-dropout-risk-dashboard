"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

const data = [
    { month: "Jan", risk: 25, attendance: 85, engagement: 6.5 },
    { month: "Feb", risk: 32, attendance: 82, engagement: 6.2 },
    { month: "Mar", risk: 45, attendance: 75, engagement: 5.8 },
    { month: "Apr", risk: 58, attendance: 65, engagement: 5.0 },
    { month: "May", risk: 68, attendance: 55, engagement: 4.5 },
    { month: "Jun", risk: 65, attendance: 58, engagement: 4.8 },
];

export function DropoutRiskTrendChart() {
    const [activeTab, setActiveTab] = useState("attendance");

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Dropout Risk Trend</h3>
                    <p className="text-sm text-gray-500">
                        Correlation analysis of risk factors over time
                    </p>
                </div>
                <div className="flex rounded-lg bg-gray-100 p-1">
                    {["Attendance", "Engagement", "Grades"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab.toLowerCase()
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            By {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg bg-gray-900 p-3 text-white shadow-xl">
                                            <div className="mb-1 flex items-center justify-between gap-4">
                                                <span className="text-sm font-medium">{label} Stats</span>
                                                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-200">
                                                    High Risk
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-300">
                                                    Risk Score: <span className="font-bold text-white">{payload[0].value}%</span>
                                                </p>
                                                <p className="text-xs text-gray-300">
                                                    Primary Driver: <span className="text-white">Consecutive Absences</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="risk"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 2, fill: "#3b82f6" }}
                        />
                        {/* Dashed line for comparison - mock data */}
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#e5e7eb"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
