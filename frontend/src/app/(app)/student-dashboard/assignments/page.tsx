"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService, type AssignmentProgress } from "@/services/student";
import { Loader2, CheckCircle, Clock, AlertCircle, FileText, Calendar } from "lucide-react";

export default function AssignmentsPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<AssignmentProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (user?.student_id) {
                try {
                    const assignmentsData = await studentService.getAssignments(user.student_id);
                    setData(assignmentsData);
                } catch (error) {
                    console.error("Failed to fetch assignments data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <AlertCircle size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-medium">No assignment data found.</p>
            </div>
        );
    }

    const filteredAssignments = data.assignments.filter(a => {
        if (filter === 'completed') return ['Submitted', 'Graded'].includes(a.status);
        if (filter === 'pending') return ['Pending', 'Overdue'].includes(a.status);
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Track pending tasks and submissions.</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'completed' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Completion Progress</h3>
                    <span className="text-2xl font-bold text-indigo-600">{data.completion_percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data.completion_percentage}%` }}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Total</p>
                        <p className="text-lg font-bold text-gray-900">{data.total}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Completed</p>
                        <p className="text-lg font-bold text-green-600">{data.completed}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Pending</p>
                        <p className="text-lg font-bold text-amber-600">{data.pending}</p>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="grid gap-4">
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((item, idx) => {
                        const isLate = item.status === 'Overdue';
                        const isCompleted = ['Submitted', 'Graded'].includes(item.status);

                        return (
                            <div
                                key={idx}
                                className={`bg-white p-5 rounded-xl border shadow-sm transition-all hover:shadow-md flex items-start gap-4 ${isLate ? 'border-l-4 border-l-red-500' : isCompleted ? 'border-l-4 border-l-green-500' : 'border-gray-100'}`}
                            >
                                <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' :
                                        isLate ? 'bg-red-100 text-red-600' :
                                            'bg-amber-100 text-amber-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={20} /> :
                                        isLate ? <AlertCircle size={20} /> :
                                            <Clock size={20} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.assessment.title}</h3>
                                            <p className="text-sm text-gray-500">{item.assessment.course_name} • {item.assessment.type}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-green-50 text-green-700' :
                                                isLate ? 'bg-red-50 text-red-700' :
                                                    'bg-amber-50 text-amber-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            <span>Due: {new Date(item.assessment.due_date).toLocaleDateString()}</span>
                                        </div>
                                        {item.submission_date && (
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <CheckCircle size={14} />
                                                <span>Submitted: {new Date(item.submission_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {item.assessment.total_marks > 0 && (
                                            <div className="flex items-center gap-1.5 ml-auto font-medium text-gray-700">
                                                <FileText size={14} />
                                                <span>Score: {item.obtained_marks !== null ? item.obtained_marks : '-'}/{item.assessment.total_marks}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No {filter !== 'all' ? filter : ''} assignments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
