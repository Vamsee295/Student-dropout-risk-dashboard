"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService, type StudentOverview } from "@/services/student";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    BookOpen,
    Calendar
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function StudentDashboardOverview() {
    const { user } = useAuthStore();
    const [data, setData] = useState<StudentOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.student_id) {
                try {
                    const overviewData = await studentService.getOverview(user.student_id);
                    setData(overviewData);
                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <AlertTriangle size={48} className="mb-4 text-amber-500" />
                <p className="text-lg font-medium">No student data found.</p>
                <p className="text-sm">Please ensure you are logged in as a valid student.</p>
            </div>
        );
    }

    const baseScore = data.engagement_score;
    const trendData = [
        { month: 'Jan', score: Math.round(baseScore * 0.85) },
        { month: 'Feb', score: Math.round(baseScore * 0.90) },
        { month: 'Mar', score: Math.round(baseScore * 0.95) },
        { month: 'Apr', score: Math.round(baseScore * 0.97) },
        { month: 'May', score: Math.round(baseScore) },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-gray-500">Here's your academic progress overview.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Attendance"
                    value={`${data.attendance_rate.toFixed(1)}%`}
                    icon={<Clock className="text-blue-600" />}
                    trend={data.attendance_rate < 75 ? "down" : "stable"}
                    trendLabel={data.attendance_rate < 75 ? `${(75 - data.attendance_rate).toFixed(1)}% below threshold` : `${(data.attendance_rate - 75).toFixed(1)}% above threshold`}
                    subText={data.attendance_rate < 75 ? "Below 75% threshold" : "Good attendance"}
                    color="blue"
                />
                <MetricCard
                    title="Avg Marks"
                    value={`${data.avg_marks.toFixed(1)}%`}
                    icon={<BookOpen className="text-purple-600" />}
                    trend={data.avg_marks >= 50 ? "stable" : "down"}
                    trendLabel={data.avg_marks >= 50 ? "On track" : "Needs improvement"}
                    subText="Across all subjects"
                    color="purple"
                />
                <MetricCard
                    title="Engagement"
                    value={data.engagement_score.toFixed(1)}
                    icon={<TrendingUp className="text-emerald-600" />}
                    trend={data.engagement_score >= 50 ? "up" : "down"}
                    trendLabel={data.engagement_score >= 50 ? "Active" : "Low activity"}
                    subText="Activity score (0-100)"
                    color="emerald"
                />
                <MetricCard
                    title="Risk Level"
                    value={data.risk_level}
                    icon={<AlertTriangle className={getRiskColor(data.risk_level)} />}
                    trend={data.risk_trend === "up" ? "down" : "stable"}
                    trendLabel={`${data.dropout_probability.toFixed(1)}% probability`}
                    subText={`Probability: ${data.dropout_probability.toFixed(1)}%`}
                    color={getRiskColorName(data.risk_level)}
                    highlight
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Engagement Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900">Engagement Trend</h3>
                        <select className="text-sm border-gray-200 rounded-lg text-gray-500">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Deadlines & Attendance */}
                <div className="space-y-6">

                    {/* Upcoming Deadlines */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            {data.upcoming_deadlines.length > 0 ? (
                                data.upcoming_deadlines.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.course_name}</p>
                                            <p className="text-xs font-medium text-amber-600 mt-1">
                                                Due: {new Date(item.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No upcoming deadlines.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Attendance */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle size={18} className="text-gray-400" />
                            Recent Attendance
                        </h3>
                        <div className="space-y-3">
                            {data.recent_attendance.map((record) => (
                                <div key={record.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">{record.course_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'Present'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Helper Components & Functions

function MetricCard({ title, value, icon, trend, subText, color, highlight = false, trendLabel }: any) {
    const bgColors: any = {
        blue: "bg-blue-50 text-blue-700",
        purple: "bg-purple-50 text-purple-700",
        emerald: "bg-emerald-50 text-emerald-700",
        red: "bg-red-50 text-red-700",
        amber: "bg-amber-50 text-amber-700",
    };

    const displayLabel = trendLabel || (trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable');

    return (
        <div className={`p-6 rounded-xl border transition-all hover:shadow-md ${highlight ? 'bg-white shadow-sm ring-1 ring-inset ring-gray-200' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${bgColors[color] || "bg-gray-50"}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-medium ${trend === 'up' || trend === 'stable' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend === 'up' || trend === 'stable' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {displayLabel}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{subText}</p>
            </div>
        </div>
    );
}

function getRiskColor(level: string) {
    switch (level) {
        case "High Risk": return "text-red-600";
        case "Moderate Risk": return "text-amber-600";
        default: return "text-green-600";
    }
}

function getRiskColorName(level: string) {
    switch (level) {
        case "High Risk": return "red";
        case "Moderate Risk": return "amber";
        default: return "emerald";
    }
}
