"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Plus,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    User,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

type Status = 'Needs Review' | 'Counseling Scheduled' | 'Monitoring' | 'Resolved';

interface StudentCard {
    id: string;
    name: string;
    riskScore: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    status: Status;
    lastUpdated: string;
    avatar: string;
}

const initialData: StudentCard[] = [
    { id: 'S001', name: 'John Student', riskScore: 88, riskLevel: 'High', status: 'Needs Review', lastUpdated: '2h ago', avatar: 'JS' },
    { id: 'S002', name: 'Emily Chen', riskScore: 72, riskLevel: 'Medium', status: 'Needs Review', lastUpdated: '5h ago', avatar: 'EC' },
    { id: 'S003', name: 'Michael Brown', riskScore: 92, riskLevel: 'High', status: 'Counseling Scheduled', lastUpdated: '1d ago', avatar: 'MB' },
    { id: 'S004', name: 'Sarah Davis', riskScore: 65, riskLevel: 'Medium', status: 'Monitoring', lastUpdated: '3d ago', avatar: 'SD' },
    { id: 'S005', name: 'David Wilson', riskScore: 45, riskLevel: 'Low', status: 'Resolved', lastUpdated: '1w ago', avatar: 'DW' },
];

const columns: Status[] = ['Needs Review', 'Counseling Scheduled', 'Monitoring', 'Resolved'];

export default function InterventionBoard() {
    const [students, setStudents] = useState<StudentCard[]>(initialData);
    const [draggedStudent, setDraggedStudent] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, studentId: string) => {
        setDraggedStudent(studentId);
        e.dataTransfer.setData("studentId", studentId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, status: Status) => {
        e.preventDefault();
        const studentId = e.dataTransfer.getData("studentId");

        if (studentId) {
            setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, status } : s
            ));
        }
        setDraggedStudent(null);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'bg-red-100 text-red-700 border-red-200';
            case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Intervention Board</h1>
                    <p className="text-gray-500">Manage student cases and track intervention progress.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus size={18} />
                    New Case
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 min-w-[1000px] h-full pb-4">
                    {columns.map(column => (
                        <div
                            key={column}
                            className="flex-1 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200/60 min-w-[280px]"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column)}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-gray-200/60 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-700 text-sm">{column}</h3>
                                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                        {students.filter(s => s.status === column).length}
                                    </span>
                                </div>
                                <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>

                            {/* Cards Container */}
                            <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                {students
                                    .filter(s => s.status === column)
                                    .map(student => (
                                        <div
                                            key={student.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, student.id)}
                                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move group active:cursor-grabbing"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskColor(student.riskLevel)}`}>
                                                    {student.riskLevel} Risk
                                                </span>
                                                <div className="relative group/menu">
                                                    <MoreHorizontal size={14} className="text-gray-400 hover:text-gray-600" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100">
                                                    {student.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">{student.name}</h4>
                                                    <p className="text-xs text-gray-500">ID: #{student.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {student.lastUpdated}
                                                </span>
                                                <Link
                                                    href={`/students/${student.id}`}
                                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    View Profile <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                {students.filter(s => s.status === column).length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg py-8 bg-gray-50/50">
                                        <p className="text-xs font-medium">No students</p>
                                        <p className="text-[10px] opacity-70">Drag items here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
