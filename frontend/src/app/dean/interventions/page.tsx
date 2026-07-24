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
    Bell
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api";
import { useNotifications } from "@/context/NotificationsContext";

type Status = 'Needs Review' | 'Counseling Scheduled' | 'Monitoring' | 'Resolved';

interface StudentCard {
    id: string;
    name: string;
    riskScore: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    status: Status;
    lastUpdated: string;
    avatar: string;
    assignedFaculty?: string;
}

const columns: Status[] = ['Needs Review', 'Counseling Scheduled', 'Monitoring', 'Resolved'];

// Dummy faculty list for assignment
const FACULTY_LIST = [
    { id: "f1", name: "Dr. Sarah Jenkins" },
    { id: "f2", name: "Prof. Michael Chen" },
    { id: "f3", name: "Dr. Emily Rodriguez" },
    { id: "f4", name: "Prof. James Wilson" },
];

export default function DeanInterventionBoard() {
    const [students, setStudents] = useState<StudentCard[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotifications();

    // Notice Board state
    const [notices, setNotices] = useState([
        { id: 1, text: "End of semester reviews due next Friday.", date: "Today" },
        { id: 2, text: "High risk student counseling protocol updated.", date: "Yesterday" }
    ]);
    const [newNotice, setNewNotice] = useState("");

    useEffect(() => {
        apiClient.get('/analytics/at-risk-students')
            .then(res => {
                const fetched: StudentCard[] = (res.data.students || []).map((s: any) => ({
                    ...s,
                    riskLevel: s.riskLevel as 'High' | 'Medium' | 'Low',
                    status: s.status as Status,
                    assignedFaculty: s.assignedFaculty || null // Initialize if not present
                }));
                setStudents(fetched);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

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

    const assignFaculty = (studentId: string, facultyName: string) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, assignedFaculty: facultyName } : s
        ));

        const student = students.find(s => s.id === studentId);
        if (student) {
            addNotification({
                title: "New Student Assigned",
                message: `You have been assigned to monitor ${student.name} (${student.riskLevel} Risk).`,
                type: "intervention"
            });
        }
    };

    const handleAddNotice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotice.trim()) return;
        setNotices([{ id: Date.now(), text: newNotice, date: "Just now" }, ...notices]);
        setNewNotice("");
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">

            {/* Main Kanban Board (Left Side) */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dean Intervention Board</h1>
                        <p className="text-gray-500">Oversee student cases, manage faculty assignments, and track progress.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[800px] h-full">
                        {columns.map(column => (
                            <div
                                key={column}
                                className="flex-1 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200/60 min-w-[260px]"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column)}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-gray-200/60 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-700 text-sm whitespace-nowrap">{column}</h3>
                                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                            {students.filter(s => s.status === column).length}
                                        </span>
                                    </div>
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

                                                    {/* Faculty Assignment Dropdown */}
                                                    <div className="relative group/menu">
                                                        <button className="text-xs flex items-center gap-1 font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 transition-colors">
                                                            <User size={12} />
                                                            {student.assignedFaculty ? "Assigned" : "Assign"}
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                                                            <div className="p-2 space-y-1">
                                                                <p className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">Assign to Faculty</p>
                                                                {FACULTY_LIST.map(faculty => (
                                                                    <button
                                                                        key={faculty.id}
                                                                        onClick={() => assignFaculty(student.id, faculty.name)}
                                                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${student.assignedFaculty === faculty.name ? 'bg-violet-50 text-violet-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                                                                    >
                                                                        {faculty.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-xs font-bold text-violet-600 border border-violet-100 shrink-0">
                                                        {student.avatar}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">{student.name}</h4>
                                                        <p className="text-xs text-gray-500 truncate">{student.assignedFaculty ? `Faculty: ${student.assignedFaculty}` : 'Unassigned'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                                        <Clock size={12} /> {student.lastUpdated}
                                                    </span>
                                                    <Link
                                                        href={`/students/${student.id}`}
                                                        className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium whitespace-nowrap"
                                                    >
                                                        Profile <ArrowRight size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    {students.filter(s => s.status === column).length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg py-8 bg-gray-50/50">
                                            <p className="text-xs font-medium">No students</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notice Board Sidebar (Right Side) */}
            <div className="w-80 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shrink-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Bell size={18} className="text-violet-600" />
                    <h2 className="font-bold text-gray-900">Notice Board</h2>
                </div>

                <div className="p-4 border-b border-gray-100 bg-white">
                    <form onSubmit={handleAddNotice} className="flex flex-col gap-2">
                        <textarea
                            value={newNotice}
                            onChange={(e) => setNewNotice(e.target.value)}
                            placeholder="Type a new notice for faculty..."
                            className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-20"
                        />
                        <button
                            type="submit"
                            disabled={!newNotice.trim()}
                            className="self-end px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            Post Notice
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {notices.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No notices posted yet.</p>
                    ) : (
                        notices.map(notice => (
                            <div key={notice.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative group">
                                <span className="absolute top-3 right-3 text-[10px] font-medium text-gray-400">{notice.date}</span>
                                <p className="text-sm text-gray-700 pr-12 leading-relaxed">{notice.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
