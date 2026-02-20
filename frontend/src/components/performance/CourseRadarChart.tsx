"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Target } from "lucide-react";
import {
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Legend, ReferenceLine, Cell
} from "recharts";
import apiClient from "@/lib/api";

interface Course {
    course_id: string;
    course_name: string;
    credits: number;
    is_core: boolean;
    attendance_pct: number;
    internal_marks: number;
    assignment_score: number;
    midterm_score: number;
    final_score: number;
    peer_avg: number;
    overall_grade: number;
    passed: boolean;
    radar: Record<string, number>;
    box_plot: {
        min: number; q1: number; median: number; q3: number; max: number; student_value: number;
    };
}

interface CourseRadarChartProps {
    department?: string;
}

function BoxPlot({ bp }: { bp: Course["box_plot"] }) {
    const scale = (v: number) => `${v}%`;
    const pct = (v: number) => `${v.toFixed(1)}%`;
    return (
        <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
                <span>{pct(bp.min)}</span>
                <span className="font-semibold text-gray-600">Median {pct(bp.median)}</span>
                <span>{pct(bp.max)}</span>
            </div>
            <div className="relative h-5 flex items-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="h-1 w-full bg-gray-100 rounded-full" />
                </div>
                {/* Box */}
                <div
                    className="absolute h-4 rounded-md bg-indigo-200 border border-indigo-400"
                    style={{ left: `${bp.q1}%`, width: `${bp.q3 - bp.q1}%` }}
                />
                {/* Median line */}
                <div className="absolute h-4 w-0.5 bg-indigo-700" style={{ left: `${bp.median}%` }} />
                {/* Student dot */}
                <div
                    className="absolute h-4 w-1.5 rounded-sm bg-orange-500 z-10"
                    style={{ left: `${bp.student_value}%` }}
                    title={`You: ${pct(bp.student_value)}`}
                />
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">Q1 {pct(bp.q1)}</span>
                <span className="text-orange-600 font-semibold">● You: {pct(bp.student_value)}</span>
                <span className="text-gray-400">Q3 {pct(bp.q3)}</span>
            </div>
        </div>
    );
}

export function CourseRadarChart({ department = "All Departments" }: CourseRadarChartProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        apiClient.get(`/performance/course-detail${params}`)
            .then(r => r.data)
            .then(d => {
                setCourses(d.courses || []);
                if (d.courses?.length) setSelected(d.courses[0].course_id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />;

    const activeCourse = courses.find(c => c.course_id === selected);
    const radarData = activeCourse
        ? [
            { metric: "Attendance", value: activeCourse.radar.attendance },
            { metric: "Internal", value: activeCourse.radar.internal },
            { metric: "Assignment", value: activeCourse.radar.assignment },
            { metric: "Midterm", value: activeCourse.radar.midterm },
            { metric: "Final", value: activeCourse.radar.final },
            { metric: "vs Peers", value: activeCourse.radar.peer_comp },
        ] : [];

    const gradeColor = (g: number) => g >= 75 ? "#10b981" : g >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Target size={18} className="text-indigo-500" />
                <h3 className="text-base font-bold text-gray-900">Course Deep Dive</h3>
            </div>

            {/* Course Selector Grid */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {courses.map(c => (
                    <button
                        key={c.course_id}
                        onClick={() => setSelected(c.course_id)}
                        className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${selected === c.course_id
                                ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                : "border-gray-100 bg-white"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold rounded px-1.5 py-0.5 ${c.is_core ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                                {c.is_core ? "Core" : "Elec"}
                            </span>
                            <span className={`text-xs font-bold ${c.passed ? "text-emerald-600" : "text-red-500"}`}>
                                {c.passed ? "✓" : "✗"}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{c.course_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{c.overall_grade.toFixed(0)}%</p>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${c.overall_grade}%`, background: gradeColor(c.overall_grade) }} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail Panel */}
            {activeCourse && (
                <div className="grid gap-4 lg:grid-cols-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    {/* Left: Radar */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3">{activeCourse.course_name} — Multi-metric Radar</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#f3f4f6" />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} dot />
                                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Right: Metrics + Box Plot */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700">Detailed Breakdown</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Attendance", value: activeCourse.attendance_pct },
                                { label: "Internal Marks", value: activeCourse.internal_marks },
                                { label: "Assignment", value: activeCourse.assignment_score },
                                { label: "Midterm", value: activeCourse.midterm_score },
                                { label: "Final Exam", value: activeCourse.final_score },
                                { label: "Peer Avg", value: activeCourse.peer_avg, isPeer: true },
                            ].map(item => (
                                <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className={`text-lg font-bold ${item.isPeer ? "text-blue-600" : item.value < 50 ? "text-red-600" : item.value >= 75 ? "text-emerald-600" : "text-yellow-600"}`}>
                                        {item.value.toFixed(1)}%
                                    </p>
                                    <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.isPeer ? "#3b82f6" : gradeColor(item.value) }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Student vs Class Distribution</p>
                            <BoxPlot bp={activeCourse.box_plot} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
