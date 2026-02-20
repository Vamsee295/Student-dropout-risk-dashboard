"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";

interface HighRiskStudent {
    id: string;
    name: string;
    avatar: string;
    risk_percentage: number;
    risk_level: string;
}

interface HighRiskStudentListProps {
    onIntervene?: (student: { name: string; id: string; risk: number }) => void;
}

export function HighRiskStudentList({ onIntervene }: HighRiskStudentListProps) {
    const [students, setStudents] = useState<HighRiskStudent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await apiClient.get('/engagement/high-risk-students');
            const data = response.data;
            setStudents(data.students || []);
        } catch (error) {
            console.error("Error fetching high-risk students:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="text-center py-8 text-gray-500">Loading...</div>
        </div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <h3 className="font-bold text-gray-900">High Risk Students</h3>
                </div>
                <Link href="/students" className="text-xs font-semibold text-blue-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-400 pb-2 border-b border-gray-50">
                    <span className="col-span-6">Student</span>
                    <span className="col-span-3 text-center">Risk</span>
                    <span className="col-span-3 text-right">Action</span>
                </div>

                {students.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">No high-risk students</div>
                ) : (
                    students.map((student) => (
                        <div key={student.id} className="grid grid-cols-12 items-center">
                            <div className="col-span-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                                    {student.avatar.startsWith('http') ? (
                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        student.avatar
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-xs">{student.name}</h4>
                                    <p className="text-[10px] text-gray-500">ID: #{student.id}</p>
                                </div>
                            </div>
                            <div className="col-span-3 text-center">
                                <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                    {student.risk_percentage}%
                                </span>
                            </div>
                            <div className="col-span-3 text-right">
                                <button
                                    onClick={() => onIntervene?.({
                                        name: student.name,
                                        id: student.id,
                                        risk: student.risk_percentage
                                    })}
                                    className="px-2 py-1 rounded border border-blue-200 text-blue-600 text-[10px] font-bold hover:bg-blue-50"
                                >
                                    Intervene
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
