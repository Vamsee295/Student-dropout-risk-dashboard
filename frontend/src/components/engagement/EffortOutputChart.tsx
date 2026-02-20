"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import apiClient from "@/lib/api";

interface WeeklyData {
    week: string;
    hours_spent: number;
    assignments_submitted: number;
}

export function EffortOutputChart() {
    const [data, setData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await apiClient.get('/engagement/effort-vs-output');
            const result = response.data;
            setData(result.weeks || []);
        } catch (error) {
            console.error("Error fetching effort vs output data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="text-center py-8 text-gray-500">Loading chart...</div>
        </div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="font-bold text-gray-900">Effort vs. Output Analysis</h3>
            </div>
            <p className="mb-6 text-xs text-gray-500">Weekly comparison of study hours vs assignments submitted</p>

            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "12px"
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                        iconType="circle"
                    />
                    <Bar
                        dataKey="hours_spent"
                        name="Hours Spent"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="assignments_submitted"
                        name="Assignments Submitted"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
