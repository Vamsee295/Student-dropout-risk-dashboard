"use client";

import { useEffect, useState } from "react";
import { facultyService, type AnalyticsData } from "@/services/faculty";
import { Loader2, TrendingUp, Users, AlertTriangle, BookOpen } from "lucide-react";
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
    Cell
} from "recharts";

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const analyticsData = await facultyService.getAnalytics();
                setData(analyticsData);
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
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) return null;

    // Mock additional data for demonstration (since backend is limited currently)
    const attendanceTrend = [
        { month: 'Aug', cse: 85, ece: 82, me: 78 },
        { month: 'Sep', cse: 88, ece: 80, me: 75 },
        { month: 'Oct', cse: 82, ece: 78, me: 72 },
        { month: 'Nov', cse: 78, ece: 75, me: 70 },
        { month: 'Dec', cse: 75, ece: 72, me: 68 },
    ];

    const engagementDistribution = [
        { name: 'High Engagement', value: 45, color: '#10B981' },
        { name: 'Medium Engagement', value: 35, color: '#F59E0B' },
        { name: 'Low Engagement', value: 20, color: '#EF4444' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Department Analytics</h1>
                <p className="text-gray-500">Deep dive into academic performance and risk trends.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Risk by Department */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-indigo-600" />
                        Risk Score by Department
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.department_risks} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="avg_risk" name="Avg Risk" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Trends */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-600" />
                        Attendance Trends (Monthly)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="cse" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="ece" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="me" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        Student Engagement Levels
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={engagementDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {engagementDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Insights */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center">
                    <h3 className="font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <BookOpen size={18} />
                        Key Insights
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                            <AlertTriangle size={16} className="text-amber-300 mt-1 flex-shrink-0" />
                            <span className="text-sm">Computer Science department has seen a 5% increase in risk scores this month.</span>
                        </li>
                        <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                            <TrendingUp size={16} className="text-green-300 mt-1 flex-shrink-0" />
                            <span className="text-sm">First-year attendance has improved by 12% following recent interventions.</span>
                        </li>
                        <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                            <Users size={16} className="text-blue-300 mt-1 flex-shrink-0" />
                            <span className="text-sm">Assignment submission rates are lowest in the Electronics department (65%).</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
