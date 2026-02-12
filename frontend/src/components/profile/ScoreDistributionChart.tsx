"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
    { name: "HackerRank", value: 5, color: "#10b981" }, // Emerald
    { name: "SmartInterviews", value: 15, color: "#fbbf24" }, // Amber
    { name: "LeetCode", value: 10, color: "#f97316" }, // Orange
    { name: "InterviewBit", value: 20, color: "#3b82f6" }, // Blue
    { name: "CodeChef", value: 35, color: "#0ea5e9" }, // Sky
    { name: "Codeforces", value: 5, color: "#8b5cf6" }, // Violet
    { name: "Spoj", value: 10, color: "#78350f" }, // Brown
];

export function ScoreDistributionChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="flex flex-col md:flex-row h-full">
                <div className="flex-1 min-h-[250px] relative">
                    <h3 className="absolute top-0 left-0 font-bold text-gray-900 z-10">Score Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center md:items-start md:justify-center md:flex-col pl-4">
                    <div className="space-y-3">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <span className="w-8 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name}</span>
                                <span className="text-gray-400 text-[10px] ml-1">🔗</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
