"use client";

import { useState, useEffect } from "react";
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
import apiClient from "@/lib/api";

export function DropoutRiskTrendChart() {
    const [activeTab, setActiveTab] = useState("attendance");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrend() {
            try {
                const response = await apiClient.get('/analytics/risk-trend');
                setData(response.data.months || []);
            } catch (error) {
                console.error('Failed to fetch risk trend:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTrend();
    }, []);

    const getActiveDataKey = () => {
        switch (activeTab) {
            case "attendance": return "attendance";
            case "engagement": return "engagement";
            case "grades": return "grades";
            default: return "attendance";
        }
    };

    const chartData = data.map(d => ({
        ...d,
        grades: d.grades ?? 85 - (d.risk * 0.5),
    }));

    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm text-center text-gray-500">Loading trend data...</div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Dropout Risk Trend</h3>
                    <p className="text-sm text-gray-500">
                        Correlation analysis: Risk vs {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
                        data={chartData}
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
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#3b82f6", fontSize: 12 }}
                            label={{ value: "Risk Score", angle: -90, position: 'insideLeft', style: { fill: '#3b82f6', fontSize: 10 } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const riskVal = payload.find(p => p.dataKey === "risk")?.value;
                                    const secondaryVal = payload.find(p => p.dataKey === getActiveDataKey())?.value;

                                    return (
                                        <div className="rounded-lg bg-gray-900 p-3 text-white shadow-xl border border-gray-700">
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <span className="text-sm font-bold">{label} Stats</span>
                                                {Number(riskVal) > 60 && (
                                                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-200 uppercase tracking-wider border border-red-500/30">
                                                        High Risk
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center gap-4 text-xs">
                                                    <span className="text-blue-300">Risk Score:</span>
                                                    <span className="font-bold text-white">{riskVal}%</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-4 text-xs">
                                                    <span className="text-gray-400 capitalize">{activeTab}:</span>
                                                    <span className="font-bold text-white">{secondaryVal}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="risk"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                            animationDuration={1000}
                        />
                        <Line
                            yAxisId={activeTab === 'engagement' ? "right" : "left"} // Engagement is 1-10, others 0-100
                            type="monotone"
                            dataKey={getActiveDataKey()}
                            stroke="#9ca3af" // Neutral gray for secondary
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
