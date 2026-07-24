"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import { Loader2 } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ScatterChart, Scatter, ZAxis, AreaChart, Area
} from "recharts";

export default function EngagementAnalysis() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getEngagementAttendance().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
    if (!data) return <p className="text-gray-500 text-center mt-20">No engagement data available.</p>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Engagement & Attendance Analysis</h1>
                <p className="text-sm text-gray-500 mt-1">Behavioral metrics impacting dropout risk</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Avg Attendance</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{Math.round(data.avg_attendance)}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Avg Engagement Score</p>
                    <p className="text-2xl font-bold text-violet-700 mt-1">{Math.round(data.avg_engagement)}%</p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Low Attendance Students</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{data.low_attendance_count}</p>
                    <p className="text-xs text-red-400 mt-1">{Math.round(data.low_attendance_pct)}% of total</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Avg LMS Login Gap</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{Math.round(data.avg_login_gap_days)} days</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Attendance Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.attendance_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} formatter={(value) => [Math.round(Number(value)), "Students"]} />
                                <Area type="monotone" dataKey="count" name="Students" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement vs Attendance by Dept */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Engagement & Attendance by Dept</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.department_engagement || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.split(" ")[0]} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value) => [Math.round(Number(value)), "Value"]} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v === "avg_engagement" ? "Engagement" : "Attendance"}</span>} />
                                <Bar dataKey="avg_engagement" name="avg_engagement" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="avg_attendance" name="avg_attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance vs Risk Scatter */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">Attendance vs Dropout Risk Correlation</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" dataKey="attendance" name="Attendance %" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} />
                                <YAxis type="number" dataKey="risk" name="Risk %" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} />
                                <ZAxis range={[60, 60]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 8, border: "none" }} formatter={(value, name) => [Math.round(Number(value)), name]} />
                                <Scatter name="Students" data={data.attendance_risk_scatter || []} fill="#F59E0B" opacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">Note: High risk largely correlates with poor attendance (top left quadrant).</p>
                </div>
            </div>
        </div>
    );
}
