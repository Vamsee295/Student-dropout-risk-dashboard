"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import { Loader2, AlertTriangle } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ScatterChart, Scatter, ZAxis,
} from "recharts";

export default function FacultyInsights() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getFacultyPerformance().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
    if (!data || !data.faculty || data.faculty.length === 0)
        return <p className="text-gray-500 text-center mt-20">No faculty data. Upload CSV with advisor_id column.</p>;

    const faculty = data.faculty || [];
    const sorted = [...faculty].sort((a: any, b: any) => b.avg_risk - a.avg_risk);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Faculty Performance Insights</h1>
                <p className="text-sm text-gray-500 mt-1">Advisor-wise student outcomes and risk impact</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Total Advisors</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{faculty.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Avg GPA (across all)</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                        {faculty.length > 0 ? Math.round(faculty.reduce((s: number, f: any) => s + f.avg_gpa, 0) / faculty.length) : "-"}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Underperforming Advisors</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{faculty.filter((f: any) => f.performance_flag).length}</p>
                    <p className="text-xs text-gray-400 mt-1">Risk ≥ 60%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-500">Best Performing</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1 truncate">
                        {faculty.length > 0 ? [...faculty].sort((a: any, b: any) => a.avg_risk - b.avg_risk)[0]?.faculty_id : "-"}
                    </p>
                </div>
            </div>

            {/* Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Faculty vs Avg Risk */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Faculty vs Avg Risk Score</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sorted.slice(0, 10)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="faculty_id" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} formatter={(v) => [`${Math.round(Number(v))}%`, "Avg Risk"]} />
                                <Bar dataKey="avg_risk" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24}
                                    label={{ position: "top", fontSize: 9, fill: "#6B7280", formatter: (v: any) => `${Math.round(Number(v))}%` }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Faculty GPA distribution */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Faculty vs Avg GPA</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sorted.slice(0, 10)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="faculty_id" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 10]} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} formatter={(v) => [Math.round(Number(v)), "Avg GPA"]} />
                                <Bar dataKey="avg_gpa" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Faculty Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Faculty Performance Table</h3>
                    <span className="text-xs text-gray-500">{faculty.length} advisors</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase">Advisor ID</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-right">Students</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-right">Avg GPA</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-right">Avg Risk</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-right">Engagement</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-right">Attendance</th>
                                <th className="px-5 py-3 text-xs text-gray-500 font-medium uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sorted.map((f: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{f.faculty_id}</td>
                                    <td className="px-5 py-3 text-sm text-gray-600 text-right">{f.student_count}</td>
                                    <td className="px-5 py-3 text-sm text-indigo-700 font-semibold text-right">{f.avg_gpa}</td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={`text-sm font-semibold ${f.avg_risk >= 60 ? "text-red-600" : f.avg_risk >= 40 ? "text-amber-600" : "text-emerald-600"}`}>
                                            {f.avg_risk}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-600 text-right">{f.avg_engagement}%</td>
                                    <td className="px-5 py-3 text-sm text-gray-600 text-right">{f.avg_attendance}%</td>
                                    <td className="px-5 py-3 text-center">
                                        {f.performance_flag ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                <AlertTriangle size={10} /> Under-performing
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Good</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
