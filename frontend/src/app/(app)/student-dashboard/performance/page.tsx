"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService } from "@/services/student";
import { Loader2, TrendingUp, Award, BookOpen, AlertCircle } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Performance</h1>
                    <p className="text-gray-500">Track your grades and GPA across semesters.</p>
                </div>
                <select
                    className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    value={selectedSemester || ""}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                >
                    {data.map(sem => (
                        <option key={sem.semester} value={sem.semester}>Semester {sem.semester}</option>
                    ))}
                </select>
            </div>

            {currentSemData && (
                <>
                    {/* GPA Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-white/20 p-2 rounded-lg">
                                    <Award size={24} />
                                </span>
                                <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                                    Sem {currentSemData.semester}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-1">{currentSemData.gpa.toFixed(2)}</h3>
                            <p className="text-indigo-100 text-sm">Cumulative GPA (SGPA)</p>
                        </div>

                        {/* Performance Chart */}
                        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-6">Subject-wise Performance</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={currentSemData.subjects}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="course_name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} interval={0} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="internal_marks" name="Internal" stackId="a" fill="#818CF8" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="external_marks" name="External" stackId="a" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Subject Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Subject</th>
                                        <th className="px-6 py-3">Code</th>
                                        <th className="px-6 py-3">Credits</th>
                                        <th className="px-6 py-3 text-center">Internal</th>
                                        <th className="px-6 py-3 text-center">External</th>
                                        <th className="px-6 py-3 text-center">Total</th>
                                        <th className="px-6 py-3 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSemData.subjects.map((subject) => (
                                        <tr key={subject.course_id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <BookOpen size={16} />
                                                </div>
                                                {subject.course_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{subject.course_id}</td>
                                            <td className="px-6 py-4 text-gray-500">{subject.credits}</td>
                                            <td className="px-6 py-4 text-center text-gray-900">{subject.internal_marks}</td>
                                            <td className="px-6 py-4 text-center text-gray-900">{subject.external_marks}</td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-900">{subject.total_marks}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${['A+', 'A', 'B'].includes(subject.grade) ? 'bg-green-100 text-green-700' :
                                                        ['C', 'D'].includes(subject.grade) ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
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
                </>
            )}
        </div>
    );
}
