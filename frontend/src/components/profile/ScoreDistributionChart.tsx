"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const defaultData = [
    { name: "HackerRank", value: 35, color: "#10b981", url: "https://www.hackerrank.com/" }, // Emerald
    { name: "SmartInterviews", value: 15, color: "#fbbf24", url: "https://smartinterviews.in/" }, // Amber
    { name: "LeetCode", value: 20, color: "#f97316", url: "https://leetcode.com/" }, // Orange
    { name: "InterviewBit", value: 10, color: "#3b82f6", url: "https://www.interviewbit.com/" }, // Blue
    { name: "CodeChef", value: 10, color: "#0ea5e9", url: "https://www.codechef.com/" }, // Sky
    { name: "Codeforces", value: 5, color: "#8b5cf6", url: "https://codeforces.com/" }, // Violet
    { name: "Spoj", value: 5, color: "#78350f", url: "https://www.spoj.com/" }, // Brown
];

export interface ScoreData {
    name: string;
    value: number;
    color: string;
    url: string;
}

interface ScoreDistributionChartProps {
    data?: ScoreData[];
}

export function ScoreDistributionChart({ data = defaultData }: ScoreDistributionChartProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4">Score Distribution</h3>
            <div className="flex flex-col md:flex-row h-full items-center">
                <div className="flex-1 w-full h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* Outer Ring */}
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-outer-${index}`} fill={entry.color} />
                                ))}
                            </Pie>

                            {/* Inner Ring */}
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-inner-${index}`} fill={entry.color} opacity={0.8} />
                                ))}
                            </Pie>

                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3 pl-4 min-w-[150px]">
                    {data.map((item) => (
                        <a
                            key={item.name}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 group hover:bg-gray-50 p-1 rounded-md transition-colors"
                        >
                            <span className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{item.name}</span>
                            <span className="text-gray-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">🔗</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
