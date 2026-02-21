"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { exportToCSV } from "@/utils/exportUtils";

interface AtRiskStudent {
    id: string;
    name: string;
    avatar: string;
    riskScore: number; // 0-100
    riskLabel: "Critical" | "High" | "Medium";
    primaryDriver: string;
    lastActivity: string;
}

export function AtRiskStudentsTable() {
    const router = useRouter();
    const [students, setStudents] = useState<AtRiskStudent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAtRiskStudents() {
            try {
                const response = await apiClient.get('/students/all');
                const data = response.data;

                // Filter high-risk students and format for display
                const atRisk = data
                    .filter((s: any) => s.riskStatus === 'High Risk' || s.riskStatus === 'Moderate Risk')
                    .map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        avatar: s.avatar,
                        riskScore: parseFloat(s.riskValue),
                        riskLabel: s.riskStatus === 'High Risk' ? 'Critical' : s.riskStatus === 'Moderate Risk' ? 'High' : 'Medium',
                        primaryDriver: s.primaryRiskDriver || "AI Prediction",
                        lastActivity: s.lastInteraction
                    }))
                    .sort((a: any, b: any) => b.riskScore - a.riskScore)
                    .slice(0, 10); // Top 10

                setStudents(atRisk);
            } catch (error) {
                console.error('Failed to fetch at-risk students:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAtRiskStudents();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">Loading students...</div>;
    }
    return (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Predicted At-Risk Students</h3>
                    <p className="text-xs text-gray-500">Students with risk scores &gt; 75% requiring immediate intervention.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportToCSV(students.map(s => ({ Name: s.name, ID: s.id, "Risk Score": s.riskScore, "Risk Level": s.riskLabel, "Primary Driver": s.primaryDriver, "Last Activity": s.lastActivity })), "at_risk_students")} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">Export CSV</button>
                    <button onClick={() => router.push("/students")} className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700">View All</button>
                </div>
            </div>

            <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                        <th className="px-6 py-3">Student Name / ID</th>
                        <th className="px-6 py-3">Risk Score</th>
                        <th className="px-6 py-3">Primary Risk Driver</th>
                        <th className="px-6 py-3">Last Activity</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                                <Link href={`/students/${student.id}`} className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                                        {student.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</div>
                                        <div className="text-[10px] text-gray-500">ID: #{student.id}</div>
                                    </div>
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                                        {student.riskScore}% {student.riskLabel}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                    <AlertTriangle size={14} className="text-red-500" />
                                    {student.primaryDriver}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-xs text-gray-500">{student.lastActivity}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-xs font-semibold">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            apiClient.post(`/students/${student.id}/email`, {
                                                subject: "Risk Alert Notification",
                                                body: `Your current dropout risk score is ${student.riskScore}%. Please connect with your advisor.`,
                                            }).catch(() => {});
                                            const btn = e.currentTarget;
                                            btn.textContent = "Sent!";
                                            setTimeout(() => { btn.textContent = "Notify"; }, 2000);
                                        }}
                                        className="text-blue-600 hover:underline"
                                    >Notify</button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/students/${student.id}`); }}
                                        className="text-gray-500 hover:text-gray-900"
                                    >Details</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
