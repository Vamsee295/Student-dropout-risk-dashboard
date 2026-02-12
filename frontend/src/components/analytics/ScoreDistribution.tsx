"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link2 } from "lucide-react";

const data = [
    { name: "HackerRank", value: 500, color: "#10b981" }, // Emerald
    { name: "SmartInterviews", value: 3200, color: "#f59e0b" }, // Amber
    { name: "LeetCode", value: 2100, color: "#ea580c" }, // Orange
    { name: "InterviewBit", value: 800, color: "#2563eb" }, // Blue
    { name: "CodeChef", value: 1200, color: "#0ea5e9" }, // Sky
    { name: "Codeforces", value: 150, color: "#8b5cf6" }, // Violet
    { name: "Spoj", value: 300, color: "#92400e" }, // Brown
];

export function ScoreDistribution() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-base font-semibold text-slate-700">Score Distribution</h3>

            <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
                {/* Sunburst-like Donut Chart */}
                <div className="relative h-[250px] w-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="white"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 gap-y-2">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div
                                className="h-3 w-8 rounded-[2px]"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-semibold text-slate-600">
                                {item.name}
                            </span>
                            <Link2 size={12} className="text-slate-400" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
