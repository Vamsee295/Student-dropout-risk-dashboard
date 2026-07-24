"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import {
    Users, AlertTriangle, TrendingUp, Activity, GraduationCap,
    BookOpen, Loader2, Crown
} from "lucide-react";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar,
} from "recharts";

const RISK_COLORS: Record<string, string> = {
    "High Risk": "#EF4444",
    "Moderate Risk": "#F59E0B",
    "Stable": "#6366F1",
    "Safe": "#10B981",
};

function KpiCard({ title, value, sub, icon, color }: { title: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
    const bg: Record<string, string> = {
        violet: "bg-violet-50", blue: "bg-blue-50", red: "bg-red-50",
        green: "bg-green-50", amber: "bg-amber-50", indigo: "bg-indigo-50",
    };
    const text: Record<string, string> = {
        violet: "text-violet-600", blue: "text-blue-600", red: "text-red-600",
        green: "text-green-600", amber: "text-amber-600", indigo: "text-indigo-600",
    };
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${bg[color]}`}>
                    <span className={text[color]}>{icon}</span>
                </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function DeanDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getOverview().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-violet-600" size={32} />
        </div>
    );

    if (!data) return <p className="text-gray-500 text-center mt-20">No data available. Upload CSV data first.</p>;

    const pieData = Object.entries(data.risk_distribution || {})
        .filter(([, v]) => (v as number) > 0)
        .map(([name, value]) => ({ name, value: value as number, color: RISK_COLORS[name] || "#6B7280" }));

    const totalStudents = data.total_students || 0;
    const highRisk = data.high_risk_count || 0;

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Crown size={20} className="text-violet-600" />
                        <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Dean / HOD Portal</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Strategic snapshot — Institution-wide dropout risk intelligence</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total Students" value={totalStudents} icon={<Users size={20} />} color="blue" />
                <KpiCard title="Faculty Count" value={data.total_faculty || 0} icon={<GraduationCap size={20} />} color="violet" />
                <KpiCard
                    title="High Risk Students"
                    value={highRisk}
                    sub={totalStudents > 0 ? `${Math.round((highRisk / totalStudents) * 100)}% of total` : ""}
                    icon={<AlertTriangle size={20} />}
                    color="red"
                />
                <KpiCard title="Overall Risk %" value={`${data.overall_risk_pct ?? 0}%`} icon={<TrendingUp size={20} />} color="amber" />
                <KpiCard title="Avg GPA" value={data.avg_gpa ?? 0} icon={<BookOpen size={20} />} color="indigo" />
                <KpiCard title="Avg Attendance" value={`${data.avg_attendance ?? 0}%`} icon={<Activity size={20} />} color="green" />
                <KpiCard title="Avg Engagement" value={`${data.avg_engagement ?? 0}%`} icon={<Activity size={20} />} color="violet" />
                <KpiCard
                    title="Safe Students"
                    value={data.risk_distribution?.["Safe"] ?? 0}
                    sub="Low dropout risk"
                    icon={<Users size={20} />}
                    color="green"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                    {pieData.length === 0 ? (
                        <div className="flex h-56 items-center justify-center text-gray-400 text-sm">No risk data</div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, name) => [`${v} students`, String(name)]} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                                    <Legend verticalAlign="bottom" iconType="circle" iconSize={9} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Monthly Trend */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Dropout Risk Trend (Last 6 Months)</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthly_trend || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                                <Line type="monotone" dataKey="high_risk" name="High Risk Count" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: "#EF4444" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top 5 Programs + Dept bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Programs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Top 5 High-Risk Programs</h3>
                    <div className="space-y-3">
                        {(data.top_5_programs || []).map((prog: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">{prog.program}</span>
                                        <span className="text-sm font-semibold text-red-600">{prog.avg_risk}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${prog.avg_risk}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!data.top_5_programs || data.top_5_programs.length === 0) && (
                            <p className="text-gray-400 text-sm text-center py-6">No program data available</p>
                        )}
                    </div>
                </div>

                {/* Department Comparison */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Department Risk Comparison</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.top_5_programs || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="program" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.split(" ")[0]} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} formatter={(v) => [`${v}%`, "Avg Risk"]} />
                                <Bar dataKey="avg_risk" name="Avg Risk" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
