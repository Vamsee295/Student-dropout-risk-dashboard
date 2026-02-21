"use client";

import { useState, useEffect } from "react";
import {
    MoreHorizontal,
    Plus,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    User,
    ArrowRight,
    Loader2,
    X
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api";

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

const columns: Status[] = ['Needs Review', 'Counseling Scheduled', 'Monitoring', 'Resolved'];

export default function InterventionBoard() {
    const [students, setStudents] = useState<StudentCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/analytics/at-risk-students')
            .then(res => {
                const fetched: StudentCard[] = (res.data.students || []).map((s: { id: string; name: string; riskScore: number; riskLevel: string; status: string; lastUpdated: string; avatar: string }) => ({
                    id: s.id,
                    name: s.name,
                    riskScore: s.riskScore,
                    riskLevel: s.riskLevel as 'High' | 'Medium' | 'Low',
                    status: s.status as Status,
                    lastUpdated: s.lastUpdated,
                    avatar: s.avatar,
                }));
                setStudents(fetched);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);
    const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
    const [allStudents, setAllStudents] = useState<{ id: string; name: string }[]>([]);
    const [newCaseStudentId, setNewCaseStudentId] = useState("");
    const [newCaseType, setNewCaseType] = useState("counseling");
    const [newCaseNotes, setNewCaseNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isNewCaseOpen && allStudents.length === 0) {
            apiClient.get('/students/all')
                .then(res => setAllStudents((res.data || []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))))
                .catch(() => {});
        }
    }, [isNewCaseOpen, allStudents.length]);

    const handleCreateCase = async () => {
        if (!newCaseStudentId) return;
        setSubmitting(true);
        try {
            await apiClient.post('/faculty/interventions', {
                student_id: newCaseStudentId,
                type: newCaseType,
                notes: newCaseNotes,
            });
            const student = allStudents.find(s => s.id === newCaseStudentId);
            setStudents(prev => [...prev, {
                id: newCaseStudentId,
                name: student?.name || newCaseStudentId,
                riskScore: 0,
                riskLevel: 'Medium',
                status: 'Needs Review' as Status,
                lastUpdated: new Date().toLocaleDateString(),
                avatar: (student?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2),
            }]);
            setIsNewCaseOpen(false);
            setNewCaseStudentId("");
            setNewCaseType("counseling");
            setNewCaseNotes("");
        } catch (err) {
            console.error("Failed to create case:", err);
        } finally {
            setSubmitting(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Intervention Board</h1>
                    <p className="text-gray-500">Manage student cases and track intervention progress.</p>
                </div>
                <button onClick={() => setIsNewCaseOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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

            {isNewCaseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">New Intervention Case</h3>
                            <button onClick={() => setIsNewCaseOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select value={newCaseStudentId} onChange={e => setNewCaseStudentId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    <option value="">Select student...</option>
                                    {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={newCaseType} onChange={e => setNewCaseType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    <option value="counseling">Counseling</option>
                                    <option value="tutoring">Tutoring</option>
                                    <option value="mentoring">Mentoring</option>
                                    <option value="financial">Financial</option>
                                    <option value="academic">Academic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea value={newCaseNotes} onChange={e => setNewCaseNotes(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Describe the case..." />
                            </div>
                            <button disabled={!newCaseStudentId || submitting} onClick={handleCreateCase} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {submitting ? "Creating..." : "Create Case"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
