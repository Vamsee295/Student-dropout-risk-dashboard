"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api";

interface Intervention {
    id: number;
    student_id: string;
    student_name: string;
    type: string;
    status: string;
    assigned_to: string | null;
    notes: string | null;
    created_at: string | null;
    completed_at: string | null;
}

interface InterventionData {
    interventions: Intervention[];
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
}

interface InterventionTrackingProps {
    department?: string;
}

const STATUS_CONFIG = {
    pending: { icon: <Clock size={14} />, cls: "bg-yellow-100 text-yellow-700" },
    in_progress: { icon: <AlertCircle size={14} />, cls: "bg-blue-100 text-blue-700" },
    completed: { icon: <CheckCircle size={14} />, cls: "bg-emerald-100 text-emerald-700" },
    cancelled: { icon: <XCircle size={14} />, cls: "bg-gray-100 text-gray-500" },
};

const TYPE_ICONS: Record<string, string> = {
    counseling: "💬",
    tutoring: "📚",
    mentoring: "🧑‍🏫",
    financial: "💰",
    academic: "🎓",
};

function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InterventionTracking({ department = "All Departments" }: InterventionTrackingProps) {
    const [data, setData] = useState<InterventionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        apiClient.get(`/performance/interventions${params}`)
            .then(r => r.data)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />;
    if (!data) return null;

    const summaryItems = [
        { label: "Total", value: data.total, color: "text-gray-700", bg: "bg-gray-50" },
        { label: "Pending", value: data.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
        { label: "In Progress", value: data.in_progress, color: "text-blue-700", bg: "bg-blue-50" },
        { label: "Completed", value: data.completed, color: "text-emerald-700", bg: "bg-emerald-50" },
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 p-5 pb-4 border-b border-gray-100">
                <ClipboardList size={18} className="text-indigo-500" />
                <h3 className="text-base font-bold text-gray-900">Intervention Tracking</h3>
            </div>

            {/* Summary bar */}
            <div className="flex border-b border-gray-100">
                {summaryItems.map(s => (
                    <div key={s.label} className={`flex-1 p-3 text-center ${s.bg}`}>
                        <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {data.interventions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 mb-3">
                        <ClipboardList size={20} className="text-indigo-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No interventions on record</p>
                    <p className="text-xs text-gray-400">Interventions will appear as they are created</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 max-h-[380px] overflow-y-auto">
                    {data.interventions.map(iv => {
                        const statusCfg = STATUS_CONFIG[iv.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        return (
                            <div key={iv.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                                        {TYPE_ICONS[iv.type] || "📋"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-gray-800">{iv.student_name}</span>
                                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusCfg.cls}`}>
                                                {statusCfg.icon}
                                                {iv.status.replace("_", " ")}
                                            </span>
                                            <span className="rounded px-1.5 py-0.5 text-xs bg-indigo-50 text-indigo-600 font-medium capitalize">
                                                {iv.type}
                                            </span>
                                        </div>
                                        {iv.assigned_to && (
                                            <p className="mt-0.5 text-xs text-gray-500">Assigned to: <span className="font-medium text-gray-700">{iv.assigned_to}</span></p>
                                        )}
                                        {iv.notes && <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{iv.notes}</p>}
                                        <div className="mt-1 flex gap-3 text-xs text-gray-400">
                                            <span>Started: {formatDate(iv.created_at)}</span>
                                            {iv.completed_at && <span>Completed: {formatDate(iv.completed_at)}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
