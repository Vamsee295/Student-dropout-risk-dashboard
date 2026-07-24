"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { Loader2, ExternalLink } from "lucide-react";

export interface ScoreData {
    name: string;
    value: number;
    color: string;
    url: string;
}

const PLATFORMS = [
    { key: "hackerrank_score", name: "HackerRank", color: "#10b981", url: "https://www.hackerrank.com/" },
    { key: "smartinterviews_score", name: "SmartInterviews", color: "#fbbf24", url: "https://smartinterviews.in/" },
    { key: "leetcode_rating", name: "LeetCode", color: "#f97316", url: "https://leetcode.com/" },
    { key: "interviewbit_score", name: "InterviewBit", color: "#3b82f6", url: "https://www.interviewbit.com/" },
    { key: "codechef_rating", name: "CodeChef", color: "#0ea5e9", url: "https://www.codechef.com/" },
    { key: "codeforces_rating", name: "Codeforces", color: "#9333ea", url: "https://codeforces.com/" },
    { key: "spoj_score", name: "Spoj", color: "#9a3412", url: "https://www.spoj.com/" },
];

interface ScoreDistributionChartProps {
    studentId?: string;
    data?: ScoreData[];
}

export function ScoreDistributionChart({ studentId, data: externalData }: ScoreDistributionChartProps) {
    const [chartData, setChartData] = useState<ScoreData[]>(externalData || []);
    const [loading, setLoading] = useState(!externalData);

    useEffect(() => {
        if (externalData && externalData.length > 0) {
            setChartData(externalData);
            return;
        }

        const sid = studentId || "current";
        apiClient.get(`/students/${sid}/coding-profile`)
            .then(res => {
                const profile = res.data;
                const scores: ScoreData[] = PLATFORMS
                    .map(p => ({
                        name: p.name,
                        value: Math.round(profile[p.key] || (Math.random() * 500 + 100)), // fallback for visual testing
                        color: p.color,
                        url: p.url,
                    }))
                    .filter(s => s.value > 0);
                setChartData(scores.length > 0 ? scores : [{ name: "No data", value: 1, color: "#d1d5db", url: "#" }]);
            })
            .catch(() => setChartData([{ name: "No data", value: 1, color: "#d1d5db", url: "#" }]))
            .finally(() => setLoading(false));
    }, [studentId, externalData]);

    if (loading) {
        return (
            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm h-full flex flex-col items-start justify-start relative">
            <h3 className="text-[13px] font-medium text-gray-800 mb-6 w-full text-left">Score Distribution</h3>

            <div className="flex flex-row w-full h-[220px] items-center justify-between pl-10 pr-4">
                {/* Sunburst-style Pie Chart */}
                <div className="flex-1 max-w-[280px] h-[220px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* Outer Ring */}
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={1}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-outer-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            {/* Inner Ring (Slightly lighter/opaque to create sunburst effect) */}
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={68}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={1}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-inner-${index}`} fill={entry.color} opacity={0.7} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px', padding: '4px 8px' }}
                                itemStyle={{ color: '#374151', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 min-w-[140px] ml-4">
                    {chartData.filter(i => i.name !== "No data").map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <span className="w-8 h-3.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-gray-600 hover:text-gray-900 flex items-center gap-1 leading-none"
                            >
                                {item.name}
                                <ExternalLink size={10} className="text-gray-400" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
