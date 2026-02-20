"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { Loader2 } from "lucide-react";

export interface ScoreData {
    name: string;
    value: number;
    color: string;
    url: string;
}

const PLATFORMS = [
    { key: "hackerrank_score", name: "HackerRank", color: "#10b981", url: "https://www.hackerrank.com/" },
    { key: "leetcode_rating", name: "LeetCode", color: "#f97316", url: "https://leetcode.com/" },
    { key: "codechef_rating", name: "CodeChef", color: "#0ea5e9", url: "https://www.codechef.com/" },
    { key: "codeforces_rating", name: "Codeforces", color: "#8b5cf6", url: "https://codeforces.com/" },
    { key: "interviewbit_score", name: "InterviewBit", color: "#3b82f6", url: "https://www.interviewbit.com/" },
    { key: "spoj_score", name: "Spoj", color: "#78350f", url: "https://www.spoj.com/" },
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
                        value: Math.round(profile[p.key] || 0),
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
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4">Score Distribution</h3>
            <div className="flex flex-col md:flex-row h-full items-center">
                <div className="flex-1 w-full h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={2} dataKey="value" stroke="#fff" strokeWidth={2}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-outer-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="#fff" strokeWidth={2}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-inner-${index}`} fill={entry.color} opacity={0.8} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3 pl-4 min-w-[150px]">
                    {chartData.map((item) => (
                        <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group hover:bg-gray-50 p-1 rounded-md transition-colors">
                            <span className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{item.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
