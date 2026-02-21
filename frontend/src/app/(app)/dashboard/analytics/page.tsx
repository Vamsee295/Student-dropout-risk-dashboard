"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, AlertTriangle, BookOpen, ShieldAlert } from "lucide-react";
import { NoDataGate } from "@/components/NoDataGate";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Area,
} from "recharts";
import apiClient from "@/lib/api";

interface DeptAnalytics {
    department: string;
    total_students: number;
    avg_risk_score: number;
    avg_attendance: number;
    high_risk_count: number;
    trend_7d: { date: string; avg_risk: number }[];
}

const DEPT_COLORS = [
    "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"
];

export default function AnalyticsPage() {
    const [deptData, setDeptData] = useState<DeptAnalytics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await apiClient.get('/faculty/analytics/department');
                setDeptData(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <NoDataGate>
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
            </NoDataGate>
        );
    }

    // Risk by department — horizontal bar chart data
    const riskBarData = [...deptData]
        .sort((a, b) => b.avg_risk_score - a.avg_risk_score)
        .map((d) => ({
            department: d.department,
            avg_risk: parseFloat(d.avg_risk_score.toFixed(1)),
            attendance: parseFloat(d.avg_attendance.toFixed(1)),
            high_risk: d.high_risk_count,
        }));

    // Trend lines — pull 7-day trend from first active department
    const trendDepts = deptData.filter(d => d.trend_7d && d.trend_7d.length > 1);

    // Engagement distribution approximation from real data
    const totalStudents = deptData.reduce((s, d) => s + d.total_students, 0);
    const highRiskTotal = deptData.reduce((s, d) => s + d.high_risk_count, 0);
    const safeTotal = totalStudents - highRiskTotal;
    const engagementPie = [
        { name: "Safe / Stable", value: safeTotal, color: "#10B981" },
        { name: "High Risk", value: highRiskTotal, color: "#EF4444" },
    ];

    // Top insights based on real data
    const topRiskDept = riskBarData[0];
    const topAttDept = [...deptData].sort((a, b) => a.avg_attendance - b.avg_attendance)[0];
    const highRiskPct = totalStudents > 0 ? ((highRiskTotal / totalStudents) * 100).toFixed(1) : "0";

    return (
        <NoDataGate>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Department Analytics</h1>
                <p className="text-gray-500">Deep dive into academic performance and risk trends.</p>
            </div>

            {/* Summary KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {deptData.map((dept, i) => (
                    <div key={dept.department} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                            />
                            <span className="text-xs font-medium text-gray-500 truncate">{dept.department}</span>
                        </div>
                        <p className={`text-xl font-bold ${dept.avg_risk_score >= 70 ? "text-red-600" :
                                dept.avg_risk_score >= 55 ? "text-amber-600" :
                                    dept.avg_risk_score >= 40 ? "text-indigo-600" : "text-emerald-600"
                            }`}>
                            {dept.avg_risk_score.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Avg Risk · {dept.total_students} students</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Risk Score by Department — Horizontal Bar */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-indigo-600" />
                        Risk Score by Department
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={riskBarData}
                                layout="vertical"
                                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#E5E7EB" />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 11 }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis
                                    dataKey="department"
                                    type="category"
                                    width={130}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#374151", fontSize: 11 }}
                                />
                                <Tooltip
                                    cursor={{ fill: "#F3F4F6" }}
                                    formatter={(value, name) => {
                                        if (name === "avg_risk") return [`${value}%`, "Avg Risk Score"];
                                        if (name === "attendance") return [`${value}%`, "Avg Attendance"];
                                        return [`${value}`, String(name)];
                                    }}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => (
                                        <span className="text-xs text-gray-600">
                                            {value === "avg_risk" ? "Avg Risk Score" : "Avg Attendance"}
                                        </span>
                                    )}
                                />
                                <Bar dataKey="avg_risk" name="avg_risk" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={18} />
                                <Bar dataKey="attendance" name="attendance" fill="#10B981" radius={[0, 4, 4, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 7-Day Risk Trend Lines */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-600" />
                        7-Day Risk Trend by Department
                    </h3>
                    <div className="h-[300px] w-full">
                        {trendDepts.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                                Not enough historical data yet.<br />Trends appear after scores are recalculated daily.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 10 }}
                                        allowDuplicatedCategory={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 11 }}
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        formatter={(v) => [`${Number(v).toFixed(1)}%`, "Avg Risk"]}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                    {trendDepts.map((dept, i) => (
                                        <Line
                                            key={dept.department}
                                            data={dept.trend_7d}
                                            type="monotone"
                                            dataKey="avg_risk"
                                            name={dept.department}
                                            stroke={DEPT_COLORS[i % DEPT_COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Risk vs Attendance scatter-like composed chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        High-Risk Student Count by Department
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[...deptData].sort((a, b) => b.high_risk_count - a.high_risk_count)}
                                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="department"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 10 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: "#FEF2F2" }}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(v) => [Number(v), "High Risk Students"]}
                                />
                                <Bar dataKey="high_risk_count" name="High Risk Students" radius={[4, 4, 0, 0]} barSize={36}>
                                    {deptData.map((_, i) => (
                                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Insights card — driven by real data */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center">
                    <h3 className="font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <BookOpen size={18} />
                        Key Insights
                    </h3>
                    <ul className="space-y-3">
                        {topRiskDept && (
                            <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                                <ShieldAlert size={16} className="text-red-300 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">
                                    <strong>{topRiskDept.department}</strong> has the highest avg risk score at{" "}
                                    <strong>{topRiskDept.avg_risk}%</strong> with{" "}
                                    <strong>{topRiskDept.high_risk}</strong> high-risk students.
                                </span>
                            </li>
                        )}
                        {topAttDept && (
                            <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                                <AlertTriangle size={16} className="text-amber-300 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">
                                    <strong>{topAttDept.department}</strong> has the lowest average attendance at{" "}
                                    <strong>{topAttDept.avg_attendance.toFixed(1)}%</strong>.
                                </span>
                            </li>
                        )}
                        <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                            <TrendingUp size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">
                                <strong>{highRiskPct}%</strong> of all students ({highRiskTotal} out of {totalStudents}) are
                                currently flagged as High Risk.
                            </span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
        </NoDataGate>
    );
}
