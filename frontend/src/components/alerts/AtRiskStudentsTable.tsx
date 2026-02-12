"use client";

import { MoreHorizontal, Calendar } from "lucide-react";

interface StudentRisk {
    id: string;
    name: string;
    studentId: string;
    riskScore: number;
    driver: string;
    lastActivity: string;
}

const MOCK_DATA: StudentRisk[] = [
    { id: "1", name: "John Doe", studentId: "#4521", riskScore: 98, driver: "Attendance < 50%", lastActivity: "2 days ago" },
    { id: "2", name: "Sarah Smith", studentId: "#8832", riskScore: 92, driver: "Failed Mid-terms", lastActivity: "1 day ago" },
    { id: "3", name: "Michael Brown", studentId: "#1290", riskScore: 89, driver: "LMS Inactivity", lastActivity: "5 hours ago" },
];

export function AtRiskStudentsTable() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Top Predicted At-Risk Students</h3>
                    <p className="text-xs text-slate-500">Students with risk scores {">"} 75% requiring immediate intervention.</p>
                </div>
                <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Export CSV</button>
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">View All</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                            <th className="px-6 py-3">Student Name / ID</th>
                            <th className="px-6 py-3">Risk Score</th>
                            <th className="px-6 py-3">Primary Risk Driver</th>
                            <th className="px-6 py-3">Last Activity</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_DATA.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                            {student.name.charAt(0)}{student.name.split(" ")[1]?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{student.name}</div>
                                            <div className="text-xs text-slate-500">ID: {student.studentId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                                        {student.riskScore}% Critical
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 font-medium text-slate-700">
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-red-50 text-red-500">
                                            <Calendar size={12} />
                                        </span>
                                        {student.driver}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {student.lastActivity}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 text-xs font-medium">
                                        <button className="text-blue-600 hover:underline">Notify</button>
                                        <span className="text-slate-200">|</span>
                                        <button className="text-slate-600 hover:text-slate-900">Details</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
