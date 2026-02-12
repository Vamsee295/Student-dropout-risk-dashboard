"use client";

import { useState } from "react";
import { MoreHorizontal, X, Check } from "lucide-react";
import Link from "next/link";

type Alert = {
    id: string;
    studentName: string;
    studentId: string; // Added for linking
    title: string;
    description: string;
    time: string;
    priority: "high" | "medium";
    avatarColor: string;
};

const INITIAL_ALERTS: Alert[] = [
    {
        id: "1",
        studentName: "John Doe",
        studentId: "1",
        title: "Attendance dropped below 50%",
        description: "Student has missed 3 consecutive math classes without excuse.",
        time: "10m ago",
        priority: "high",
        avatarColor: "bg-emerald-100 text-emerald-700",
    },
    {
        id: "2",
        studentName: "Sarah Smith",
        studentId: "2",
        title: "LMS Inactivity Warning",
        description: "No login activity detected for 7 days.",
        time: "2h ago",
        priority: "high",
        avatarColor: "bg-amber-100 text-amber-700",
    },
    {
        id: "3",
        studentName: "Michael Brown",
        studentId: "3",
        title: "Grade Drop Detected",
        description: "Significant grade drop detected in 'Intro to CS'.",
        time: "4h ago",
        priority: "medium",
        avatarColor: "bg-blue-100 text-blue-700",
    },
    {
        id: "4",
        studentName: "Emily Davis",
        studentId: "4",
        title: "Assignment Missing",
        description: "Failed to submit mid-term project.",
        time: "1d ago",
        priority: "medium",
        avatarColor: "bg-purple-100 text-purple-700",
    },
];

export function RecentCriticalAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

    const handleDismiss = (id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    };

    return (
        <div className="h-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                    Recent Critical Alerts
                </h3>
                <Link href="/alerts" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View All
                </Link>
            </div>

            <div className="space-y-6">
                {alerts.length === 0 ? (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                        No active alerts. Good job!
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="relative flex gap-4">
                            {/* Timeline Line */}
                            <div className="absolute left-5 top-10 h-full w-0.5 bg-slate-100 last:hidden"></div>

                            {/* Avatar */}
                            <Link href={`/students/${alert.studentId}`}>
                                <div
                                    className={`flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-transform hover:scale-105 ${alert.avatarColor}`}
                                >
                                    {alert.studentName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                            </Link>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <div className="flex justify-between">
                                    <Link href={`/students/${alert.studentId}`} className="group">
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                                            {alert.studentName}
                                        </h4>
                                        <p className="text-xs font-bold text-red-500">{alert.title}</p>
                                    </Link>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                                        <button
                                            onClick={() => handleDismiss(alert.id)}
                                            className="ml-1 text-slate-300 hover:text-slate-500"
                                            title="Dismiss Alert"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">{alert.description}</p>

                                <div className="mt-3 flex gap-2">
                                    <Link href={`/students/${alert.studentId}`} className="rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={() => handleDismiss(alert.id)}
                                        className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                    >
                                        Mark Resolved
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {alerts.length > 0 && (
                    <div className="pt-2 text-center">
                        <Link href="/alerts" className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
                            Load older alerts
                            <MoreHorizontal size={14} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
