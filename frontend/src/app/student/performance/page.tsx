"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService } from "@/services/student";
import { Loader2, AlertCircle } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend
} from "recharts";

interface SubjectPerformance {
    course_id: string;
    course_name: string;
    credits: number;
    internal_marks: number;
    external_marks: number;
    total_marks: number;
    grade: string;
    attendance_percentage: number;
}

interface SemesterPerformance {
    semester: number;
    gpa: number;
    subjects: SubjectPerformance[];
}

export default function PerformancePage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<SemesterPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.student_id) {
                try {
                    const performanceData = await studentService.getPerformance(user.student_id);
                    setData(performanceData);
                    if (performanceData.length > 0) {
                        setSelectedSemester(performanceData[0].semester);
                    }
                } catch (error) {
                    console.error("Failed to fetch performance data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    const currentSemData = data.find(s => s.semester === selectedSemester);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <AlertCircle size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-medium">No performance records found.</p>
            </div>
        );
    }

    // Prepare data for the Semester-wise CGPA area chart
    const cgpaTrendData = data.map(sem => ({
        name: `Sem ${sem.semester}`,
        gpa: Number(sem.gpa.toFixed(2))
    })).reverse(); // Assuming API might return sorted desc, we want asc for a chron chart

    // Prepare data for Radar Chart
    const radarData = currentSemData?.subjects.map(subject => ({
        subject: subject.course_name.substring(0, 15) + (subject.course_name.length > 15 ? '...' : ''),
        marks: subject.total_marks,
        fullMark: 100
    })) || [];

    return (
        <div className="space-y-6 text-gray-900 max-w-[1240px] mx-auto pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Academic Performance</h1>
                    <p className="text-gray-500 text-sm mt-1">Track your grades and GPA across semesters.</p>
                </div>
                <select
                    className="bg-white border text-sm rounded-sm border-gray-200 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 block px-4 py-2"
                    value={selectedSemester || ""}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                >
                    {data.map(sem => (
                        <option key={sem.semester} value={sem.semester}>Semester {sem.semester}</option>
                    ))}
                </select>
            </div>

            {/* Top Grid: CGPA Chart (Left) & Attendance (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Semester wise CGPA Area Chart */}
                <div className="lg:col-span-2 rounded-sm border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-[320px]">
                    <h3 className="text-[13px] font-medium text-gray-800 mb-6">Semester wise CGPA</h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cgpaTrendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ffedd5" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    domain={[0, 10]}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '13px', padding: '8px 12px' }}
                                    itemStyle={{ color: '#374151', fontSize: '13px', fontWeight: 500 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gpa"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorGpa)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart: Subject Strengths */}
                <div className="lg:col-span-1 rounded-sm border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-[320px]">
                    <h3 className="text-[13px] font-medium text-gray-800 mb-2">Subject Performance Analysis</h3>
                    <div className="flex-1 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Marks" dataKey="marks" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Attendance Panel */}
                <div className="lg:col-span-1 rounded-sm border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-[320px] overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[13px] font-medium text-gray-800">Course Attendance</h3>
                        <span className="text-[11px] text-gray-500">Sem {currentSemData?.semester}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {currentSemData?.subjects.map((subject, idx) => (
                            <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-[12px] font-medium text-gray-700 truncate pr-2" title={subject.course_name}>
                                        {subject.course_name}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-900">{subject.attendance_percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-sm overflow-hidden">
                                    <div
                                        className="h-full bg-orange-400 rounded-sm transition-all duration-500 ease-out"
                                        style={{ width: `${Math.min(100, Math.max(0, subject.attendance_percentage))}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subjects Table */}
            {currentSemData && (
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-[13px] font-medium text-gray-800">Subject Details (Sem {currentSemData.semester})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Subject</th>
                                    <th className="px-6 py-3 font-medium">Code</th>
                                    <th className="px-6 py-3 font-medium text-center">Credits</th>
                                    <th className="px-6 py-3 font-medium text-center">Internal</th>
                                    <th className="px-6 py-3 font-medium text-center">External</th>
                                    <th className="px-6 py-3 font-medium text-center">Total</th>
                                    <th className="px-6 py-3 font-medium text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSemData.subjects.map((subject, idx) => (
                                    <tr key={`${subject.course_id}-${idx}`} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-3.5 text-[13px] font-medium text-gray-800">
                                            {subject.course_name}
                                        </td>
                                        <td className="px-6 py-3.5 text-[12px] text-gray-500">{subject.course_id}</td>
                                        <td className="px-6 py-3.5 text-[12px] text-center text-gray-600">{subject.credits}</td>
                                        <td className="px-6 py-3.5 text-[12px] text-center text-gray-600">{subject.internal_marks}</td>
                                        <td className="px-6 py-3.5 text-[12px] text-center text-gray-600">{subject.external_marks}</td>
                                        <td className="px-6 py-3.5 text-[12px] text-center font-semibold text-gray-800">{subject.total_marks}</td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold ${['A+', 'A', 'B'].includes(subject.grade) ? 'bg-green-50 text-green-600' :
                                                ['C', 'D'].includes(subject.grade) ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {subject.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
