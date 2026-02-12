"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

export function RiskDistributionChart() {
    const [loading, setLoading] = useState(true);
    const [distribution, setDistribution] = useState<any>(null);

    useEffect(() => {
        async function fetchDistribution() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/api/analytics/overview`);
                const data = await response.json();
                setDistribution(data.risk_distribution || {});
            } catch (error) {
                console.error('Failed to fetch risk distribution:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDistribution();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    // Convert API response to chart format
    const chartData = [
        { name: "Safe", value: distribution['Safe'] || 0, color: "#10b981" },
        { name: "Stable", value: distribution['Stable'] || 0, color: "#3b82f6" },
        { name: "Moderate Risk", value: distribution['Moderate Risk'] || 0, color: "#f59e0b" },
        { name: "High Risk", value: distribution['High Risk'] || 0, color: "#ef4444" },
    ].filter(item => item.value > 0); // Only show non-zero categories

    const highRiskPercentage = chartData.length > 0
        ? Math.round((chartData.find(d => d.name === "High Risk")?.value || 0) / chartData.reduce((sum, d) => sum + d.value, 0) * 100)
        : 0;

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Risk Distribution</h3>

            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centered label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-900">{highRiskPercentage}%</span>
                        <span className="block text-xs text-gray-500 font-medium uppercase">High Risk</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
