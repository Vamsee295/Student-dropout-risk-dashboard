"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import apiClient from "@/lib/api";

const colors = ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"];

export function RiskProbabilityChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDistribution() {
            try {
                const response = await apiClient.get('/analytics/risk-distribution');
                const mapped = (response.data || []).map((item: any, index: number) => ({
                    range: `${item.bucket_start}-${item.bucket_end}%`,
                    value: item.count,
                    color: colors[index % colors.length],
                }));
                setData(mapped);
            } catch (error) {
                console.error('Failed to fetch risk distribution:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDistribution();
    }, []);

    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full text-center text-gray-500">Loading distribution...</div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Risk Probability Distribution</h3>
                    <p className="text-xs text-gray-500">Student population spread by risk score</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-200"></span> Low
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span> High
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="range"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
