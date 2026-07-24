"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import { Loader2 } from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";

export default function AcademicTrends() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getAcademicTrends().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
    if (!data) return <p className="text-gray-500 text-center mt-20">No academic data available.</p>;

    const passFailData = [
        { name: "Pass", value: data.pass_fail?.pass || 0, fill: "#10B981" },
        { name: "Fail", value: data.pass_fail?.fail || 0, fill: "#EF4444" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Academic Performance Trends</h1>
                <p className="text-sm text-gray-500 mt-1">GPA analysis, pass rates, and risk correlation</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Total Passing</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{data.pass_fail?.pass || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Total Failing</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{data.pass_fail?.fail || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Backlog Students</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{data.backlog_count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Backlog Rate</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{Math.round(data.backlog_rate || 0)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GPA Trend */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Semester GPA Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.gpa_trend || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 10]} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} formatter={(value) => [Math.round(Number(value)), "Avg GPA"]} />
                                <Line type="monotone" dataKey="avg_gpa" name="Avg GPA" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GPA Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">GPA Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.gpa_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} cursor={{ fill: "#F3F4F6" }} formatter={(value) => [Math.round(Number(value)), "Students"]} />
                                <Bar dataKey="count" name="Students" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pass / Fail */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Pass vs Fail (Current Semester)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={passFailData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} width={50} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} cursor={{ fill: "#F3F4F6" }} formatter={(value) => [Math.round(Number(value)), "Students"]} />
                                <Bar dataKey="value" name="Students" radius={[0, 4, 4, 0]} barSize={32}>
                                    {passFailData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GPA vs Risk Scatter */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">GPA vs Dropout Risk Correlation</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis type="number" dataKey="gpa" name="GPA" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 10]} />
                                <YAxis type="number" dataKey="risk" name="Risk %" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} />
                                <ZAxis range={[60, 60]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 8, border: "none" }} formatter={(value, name) => [Math.round(Number(value)), name]} />
                                <Scatter name="Students" data={data.gpa_risk_scatter || []} fill="#EF4444" opacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">Note: Higher risk correlates with lower GPA (bottom right).</p>
                </div>
            </div>
        </div>
    );
}
