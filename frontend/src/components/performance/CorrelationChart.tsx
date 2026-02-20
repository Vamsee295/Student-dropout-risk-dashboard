"use client";

import { useState, useEffect } from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from "@/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-xl text-xs">
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                <div className="space-y-1">
                    <p className="text-blue-600 font-medium">Attendance: {payload[0].value}%</p>
                    <p className="text-emerald-600 font-medium">GPA: {payload[1].value}</p>
                </div>
            </div>
        );
    }
    return null;
};

export function CorrelationChart() {
    const [data, setData] = useState<{ name: string; attendance: number; gpa: string; risk: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get("/performance/course-detail");
                const courses = res.data.courses || [];
                setData(
                    courses.map((course: any) => ({
                        name: course.course_name,
                        attendance: course.attendance_pct,
                        gpa: (course.overall_grade / 25).toFixed(1),
                        risk: course.overall_grade < 50 ? "High" : course.overall_grade < 70 ? "Medium" : "Low",
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch course performance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-center min-h-[300px]">
                <p className="text-gray-500">Loading performance data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-center min-h-[300px]">
                <p className="text-gray-500">No course performance data available.</p>
            </div>
        );
    }

    return (
        <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900">Performance Overview</h3>
                    <p className="text-xs text-gray-500">Attendance vs. GPA by Course</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                        <CartesianGrid stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="name"
                            scale="band"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                        />
                        <YAxis
                            yAxisId="left"
                            label={{ value: 'Attendance (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6' }}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'GPA', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10b981' }}
                            domain={[0, 4]}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar yAxisId="left" dataKey="attendance" name="Attendance %" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="gpa" name="GPA" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
