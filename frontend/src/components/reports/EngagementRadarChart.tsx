"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { Loader2 } from "lucide-react";

interface RadarDataPoint {
    subject: string;
    student: number;
    average: number;
    fullMark: number;
}

export function EngagementRadarChart() {
    const [data, setData] = useState<RadarDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/engagement/overview')
            .then(res => {
                const d = res.data;
                const loginRate = Math.round(d.avg_login_rate || 0);
                const timeSpent = Math.min(100, Math.round((d.avg_time_spent || 0) * 10));
                const completion = Math.round(d.assignment_completion || 0);
                setData([
                    { subject: 'Login Activity', student: loginRate, average: 80, fullMark: 100 },
                    { subject: 'Time Spent', student: timeSpent, average: 75, fullMark: 100 },
                    { subject: 'Assignment Completion', student: completion, average: 85, fullMark: 100 },
                    { subject: 'Engagement Score', student: Math.round((loginRate + completion) / 2), average: 78, fullMark: 100 },
                    { subject: 'Consistency', student: Math.min(100, Math.round(loginRate * 0.9)), average: 82, fullMark: 100 },
                ]);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="mb-2">
                <h3 className="font-bold text-gray-900">Engagement vs Class Average</h3>
                <p className="text-xs text-gray-500">Login Activity, Time Spent, Completion</p>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Student" dataKey="student" stroke="#f87171" fill="#f87171" fillOpacity={0.3} />
                        <Radar name="Class Average" dataKey="average" stroke="#93c5fd" fill="#93c5fd" fillOpacity={0.3} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
