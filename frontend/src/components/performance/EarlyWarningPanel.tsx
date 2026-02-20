"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import apiClient from "@/lib/api";

interface Alert {
    student_id: string;
    student_name: string;
    type: string;
    severity: "High" | "Medium";
    message: string;
}

interface WarningData {
    alerts: Alert[];
    summary: {
        total_alerts: number;
        high_severity: number;
        medium_severity: number;
        students_flagged: number;
    };
}

interface EarlyWarningPanelProps {
    department?: string;
}

const TYPE_LABELS: Record<string, string> = {
    gpa_drop: "GPA Drop",
    consecutive_decline: "Consecutive Decline",
    failed_subjects: "Failed Subjects",
    credit_gap: "Credit Gap",
    low_assignments: "Low Assignments",
};

export function EarlyWarningPanel({ department = "All Departments" }: EarlyWarningPanelProps) {
    const [data, setData] = useState<WarningData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        apiClient.get(`/performance/early-warnings${params}`)
            .then(r => r.data)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />;
    if (!data) return null;

    const visibleAlerts = showAll ? data.alerts : data.alerts.slice(0, 8);

    const toggle = (i: number) => {
        const next = new Set(expanded);
        next.has(i) ? next.delete(i) : next.add(i);
        setExpanded(next);
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-orange-500" />
                    <h3 className="text-base font-bold text-gray-900">Early Warning System</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                        <AlertTriangle size={12} />
                        {data.summary.high_severity} High
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-600">
                        <AlertCircle size={12} />
                        {data.summary.medium_severity} Medium
                    </span>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/50">
                {[
                    { label: "Alerts", value: data.summary.total_alerts },
                    { label: "Students Flagged", value: data.summary.students_flagged },
                    { label: "High Priority", value: data.summary.high_severity },
                ].map(s => (
                    <div key={s.label} className="p-3 text-center">
                        <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Alerts list */}
            <div className="divide-y divide-gray-50">
                {visibleAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mb-3">
                            <Bell size={20} className="text-emerald-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No active warnings</p>
                        <p className="text-xs text-gray-400">All students are within normal thresholds</p>
                    </div>
                ) : (
                    visibleAlerts.map((alert, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.severity === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {alert.severity === "High" ? <AlertTriangle size={16} /> : <AlertCircle size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-800">{alert.student_name}</span>
                                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${alert.severity === "High" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
                                            }`}>
                                            {TYPE_LABELS[alert.type] || alert.type}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-500 leading-relaxed">{alert.message}</p>
                                </div>
                                <button
                                    onClick={() => toggle(i)}
                                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    {expanded.has(i) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>
                            {expanded.has(i) && (
                                <div className="mt-3 ml-11 rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Student ID: <span className="font-mono font-semibold text-gray-700">{alert.student_id}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Recommended action: Schedule an academic counseling session immediately.</p>
                                    <button className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                        + Create Intervention →
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {data.alerts.length > 8 && (
                <div className="border-t border-gray-100 px-4 py-3">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
                    >
                        {showAll ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {data.alerts.length} alerts</>}
                    </button>
                </div>
            )}
        </div>
    );
}
