"use client";

import { MoreHorizontal, Mail, Calendar } from "lucide-react";
import Link from "next/link";

interface Student {
    id: string;
    name: string;
    avatar: string; // Initials or URL
    course: string;
    department: string;
    riskTrend: "up" | "down" | "stable";
    riskValue: string; // e.g. "+12% Risk"
    attendance: number;
    engagementScore: number;
    lastInteraction: string;
    lastInteractionType: string;
}

const students: Student[] = [
    {
        id: "20248912",
        name: "Marcus Chen",
        avatar: "MC",
        course: "B.Sc. Comp Sci",
        department: "Engineering Dept",
        riskTrend: "up",
        riskValue: "+12% Risk",
        attendance: 62,
        engagementScore: 45,
        lastInteraction: "Oct 24, 2025",
        lastInteractionType: "Scheduled Meeting",
    },
    {
        id: "20243301",
        name: "Sarah Miller",
        avatar: "SM",
        course: "BA Psychology",
        department: "Humanities Dept",
        riskTrend: "stable",
        riskValue: "Stable",
        attendance: 78,
        engagementScore: 68,
        lastInteraction: "Oct 18, 2025",
        lastInteractionType: "Email Warning",
    },
    {
        id: "20245592",
        name: "David Kim",
        avatar: "DK",
        course: "B.Eng Mechanical",
        department: "Engineering Dept",
        riskTrend: "down",
        riskValue: "-5% Risk",
        attendance: 92,
        engagementScore: 88,
        lastInteraction: "Oct 05, 2025",
        lastInteractionType: "Check-in Call",
    },
    {
        id: "20241109",
        name: "Emma Wilson",
        avatar: "EW",
        course: "B.Sc. Data Sci",
        department: "Engineering Dept",
        riskTrend: "up",
        riskValue: "+8% Risk",
        attendance: 58,
        engagementScore: 42,
        lastInteraction: "Oct 26, 2025",
        lastInteractionType: "None",
    },
    {
        id: "20247721",
        name: "James Rodriguez",
        avatar: "JR",
        course: "B.A. History",
        department: "Humanities Dept",
        riskTrend: "down",
        riskValue: "-2% Risk",
        attendance: 81,
        engagementScore: 71,
        lastInteraction: "Oct 10, 2025",
        lastInteractionType: "Counseling Session",
    },
];

function SparklineMock({ trend }: { trend: "up" | "down" | "stable" }) {
    // Simple SVG mock for sparkline
    const color = trend === "up" ? "text-red-500" : trend === "down" ? "text-emerald-500" : "text-gray-400";

    if (trend === "up") {
        return (
            <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={color}>
                <path d="M1 14L10 10L20 12L30 4L39 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    } else if (trend === "down") {
        return (
            <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={color}>
                <path d="M1 2L10 6L20 4L30 12L39 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    } else {
        return (
            <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={color}>
                <path d="M1 8H39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
            </svg>
        );
    }
}

function EngagementBar({ score }: { score: number }) {
    let color = "bg-emerald-500";
    if (score < 50) color = "bg-red-500";
    else if (score < 75) color = "bg-amber-500";

    return (
        <div className="w-24">
            <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-500">
                <span>Score</span>
                <span>{score}/100</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

export function StudentTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 w-10">
                            <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Course / Dept</th>
                        <th className="px-6 py-4">Risk Trend</th>
                        <th className="px-6 py-4 text-center">Attendance</th>
                        <th className="px-6 py-4">Engagement</th>
                        <th className="px-6 py-4">Last Interaction</th>
                        <th className="px-6 py-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                        <tr key={student.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300" />
                            </td>
                            <td className="px-6 py-4">
                                <Link href={`/students/${student.id}`} className="block">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                                            {student.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</div>
                                            <div className="text-xs text-gray-500">ID: {student.id}</div>
                                        </div>
                                    </div>
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{student.course}</div>
                                <div className="text-xs text-gray-500">{student.department}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-center gap-1 w-20">
                                    <SparklineMock trend={student.riskTrend} />
                                    <span className={`text-[10px] font-bold ${student.riskTrend === 'up' ? 'text-red-600' :
                                        student.riskTrend === 'down' ? 'text-emerald-600' : 'text-gray-500'
                                        }`}>
                                        {student.riskValue}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-700">
                                <span className={`${student.attendance < 70 ? "text-red-600 bg-red-50" : "text-gray-700"} px-2 py-1 rounded`}>
                                    {student.attendance}%
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <EngagementBar score={student.engagementScore} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{student.lastInteraction}</div>
                                <div className="text-xs text-gray-500">{student.lastInteractionType}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Mock */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">5</span> of <span className="font-medium text-gray-900">1,240</span> results
                </p>
                <div className="flex gap-1">
                    <button className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>&lt;</button>
                    <button className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white">1</button>
                    <button className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">2</button>
                    <button className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">3</button>
                    <span className="px-2 py-1 text-gray-400">...</span>
                    <button className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">8</button>
                    <button className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">&gt;</button>
                </div>
            </div>
        </div>
    );
}
