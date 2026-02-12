"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Student } from "@/data/mockStudentData";

interface StudentTableProps {
    students: Student[];
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
}

function SparklineMock({ trend }: { trend: "up" | "down" | "stable" }) {
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

export function StudentTable({ students, selectedIds, onToggleSelection, onToggleAll }: StudentTableProps) {
    const allSelected = students.length > 0 && students.every(s => selectedIds.has(s.id));

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 w-10">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={allSelected}
                                onChange={onToggleAll}
                            />
                        </th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Course / Dept</th>
                        <th className="px-6 py-4">Risk Trend</th>
                        <th className="px-6 py-4 text-center">Attendance</th>
                        <th className="px-6 py-4">Engagement</th>
                        <th className="px-6 py-4">Advisor</th>
                        <th className="px-6 py-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                        <tr key={student.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedIds.has(student.id)}
                                    onChange={() => onToggleSelection(student.id)}
                                />
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
                                    <span className={`text-[10px] font-bold ${student.riskStatus === 'High Risk' ? 'text-red-600' :
                                        student.riskStatus === 'Safe' ? 'text-emerald-600' :
                                            student.riskStatus === 'Stable' ? 'text-blue-600' : 'text-amber-600'
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
                                <div className="text-sm font-medium text-gray-900">{student.advisor || "Unassigned"}</div>
                                <div className="text-xs text-gray-500">{student.lastInteraction}</div>
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
        </div>
    );
}
