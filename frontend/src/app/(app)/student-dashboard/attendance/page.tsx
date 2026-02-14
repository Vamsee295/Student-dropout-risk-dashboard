"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService } from "@/services/student";
import { Loader2, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface AttendanceRecord {
    id: number;
    course_id: string;
    course_name: string;
    date: string;
    status: string;
}

export default function AttendancePage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.student_id) {
                try {
                    const attendanceData = await studentService.getAttendance(user.student_id);
                    setData(attendanceData);
                } catch (error) {
                    console.error("Failed to fetch attendance data:", error);
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

    // Calculate stats
    const totalClasses = data.length;
    const attended = data.filter(r => r.status === 'Present').length;
    const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;

    // Mock trend data based on weekly aggregation (ideal approach)
    // For now, we'll mock it to show the UI
    const trendData = [
        { week: 'Week 1', pct: 90 },
        { week: 'Week 2', pct: 85 },
        { week: 'Week 3', pct: 88 },
        { week: 'Week 4', pct: 82 },
        { week: 'Current', pct: percentage },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
                <p className="text-gray-500">Monitor your daily attendance and trends.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Classes</p>
                        <h3 className="text-3xl font-bold text-gray-900">{totalClasses}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                        <Calendar size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Attended</p>
                        <h3 className="text-3xl font-bold text-green-600">{attended}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between ${percentage < 75 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                    <div>
                        <p className={`text-sm font-medium ${percentage < 75 ? 'text-red-600' : 'text-gray-500'}`}>Overall Percentage</p>
                        <h3 className={`text-3xl font-bold ${percentage < 75 ? 'text-red-700' : 'text-indigo-600'}`}>
                            {percentage.toFixed(1)}%
                        </h3>
                        {percentage < 75 && (
                            <p className="text-xs text-red-600 flex items-center mt-1">
                                <AlertTriangle size={12} className="mr-1" />
                                Below 75% Requirement
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${percentage < 75 ? 'bg-red-200 text-red-700' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-6">Attendance Trend (Last 5 Weeks)</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pct"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAtt)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Records */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Attendance Records</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {data.length > 0 ? (
                        data.map((record) => (
                            <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${record.status === 'Present' ? 'bg-green-100 text-green-600' :
                                            record.status === 'Late' ? 'bg-amber-100 text-amber-600' :
                                                'bg-red-100 text-red-600'
                                        }`}>
                                        {record.status === 'Present' ? <CheckCircle size={20} /> :
                                            record.status === 'Late' ? <Clock size={20} /> :
                                                <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{record.course_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()} • {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                        record.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {record.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No attendance records found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
