"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, TrendingDown, Minus, BookOpen,
    XCircle, FileCheck, Award, AlertTriangle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface KPIData {
    total_students: number;
    avg_gpa: number;
    prev_gpa: number;
    gpa_trend: "improving" | "declining" | "stable";
    course_pass_rate: number;
    avg_failed_subjects: number;
    assignment_submission_rate: number;
    credits_earned: number;
    credits_required: number;
    high_risk_count: number;
    moderate_risk_count: number;
}

interface AcademicKPICardsProps {
    department?: string;
}

function TrendIcon({ trend }: { trend: string }) {
    if (trend === "improving")
        return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === "declining")
        return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-yellow-500" />;
}

function getTrendColor(trend: string) {
    if (trend === "improving") return "text-emerald-600 bg-emerald-50";
    if (trend === "declining") return "text-red-600 bg-red-50";
    return "text-yellow-600 bg-yellow-50";
}

function getStatusColor(value: number, thresholds: [number, number]) {
    const [redThreshold, yellowThreshold] = thresholds;
    if (value <= redThreshold) return { bg: "bg-red-50", bar: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700" };
    if (value <= yellowThreshold) return { bg: "bg-yellow-50", bar: "bg-yellow-500", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" };
    return { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" };
}

export function AcademicKPICards({ department = "All Departments" }: AcademicKPICardsProps) {
    const [data, setData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = department !== "All Departments" ? `?department=${encodeURIComponent(department)}` : "";
        fetch(`${API_URL}/api/performance/kpis${params}`)
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    const gpaChange = (data.avg_gpa - data.prev_gpa).toFixed(2);
    const gpaChangeNum = parseFloat(gpaChange);
    const creditsPct = Math.round((data.credits_earned / data.credits_required) * 100);

    const cards = [
        {
            label: "Average GPA",
            value: data.avg_gpa.toFixed(2),
            sub: `Prev: ${data.prev_gpa.toFixed(2)}`,
            badge: `${gpaChangeNum >= 0 ? "+" : ""}${gpaChange}`,
            badgeColor: data.gpa_trend === "improving" ? "bg-emerald-100 text-emerald-700" : data.gpa_trend === "declining" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700",
            icon: <BookOpen size={18} className="text-indigo-600" />,
            iconBg: "bg-indigo-100",
            trend: data.gpa_trend,
            barPct: (data.avg_gpa / 4.0) * 100,
            barColor: data.avg_gpa < 2.0 ? "bg-red-500" : data.avg_gpa < 2.5 ? "bg-yellow-500" : "bg-emerald-500",
        },
        {
            label: "Course Pass Rate",
            value: `${data.course_pass_rate}%`,
            sub: "Students passing all courses",
            badge: data.course_pass_rate >= 75 ? "Good" : data.course_pass_rate >= 50 ? "Average" : "Low",
            badgeColor: data.course_pass_rate >= 75 ? "bg-emerald-100 text-emerald-700" : data.course_pass_rate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700",
            icon: <FileCheck size={18} className="text-emerald-600" />,
            iconBg: "bg-emerald-100",
            barPct: data.course_pass_rate,
            barColor: data.course_pass_rate >= 75 ? "bg-emerald-500" : data.course_pass_rate >= 50 ? "bg-yellow-500" : "bg-red-500",
        },
        {
            label: "Failed Subjects (Avg)",
            value: data.avg_failed_subjects.toFixed(1),
            sub: "Per student this semester",
            badge: data.avg_failed_subjects >= 2 ? "High" : data.avg_failed_subjects >= 1 ? "Medium" : "Low",
            badgeColor: data.avg_failed_subjects >= 2 ? "bg-red-100 text-red-700" : data.avg_failed_subjects >= 1 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700",
            icon: <XCircle size={18} className="text-red-600" />,
            iconBg: "bg-red-100",
            barPct: Math.min(100, (data.avg_failed_subjects / 8) * 100),
            barColor: "bg-red-500",
            invertBar: true,
        },
        {
            label: "Assignment Rate",
            value: `${data.assignment_submission_rate}%`,
            sub: "Submissions on time",
            badge: data.assignment_submission_rate >= 80 ? "On Track" : data.assignment_submission_rate >= 60 ? "At Risk" : "Critical",
            badgeColor: data.assignment_submission_rate >= 80 ? "bg-emerald-100 text-emerald-700" : data.assignment_submission_rate >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700",
            icon: <FileCheck size={18} className="text-blue-600" />,
            iconBg: "bg-blue-100",
            barPct: data.assignment_submission_rate,
            barColor: data.assignment_submission_rate >= 80 ? "bg-blue-500" : data.assignment_submission_rate >= 60 ? "bg-yellow-500" : "bg-red-500",
        },
        {
            label: "Credits Earned",
            value: `${data.credits_earned}`,
            sub: `of ${data.credits_required} required`,
            badge: `${creditsPct}%`,
            badgeColor: creditsPct >= 80 ? "bg-emerald-100 text-emerald-700" : creditsPct >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700",
            icon: <Award size={18} className="text-purple-600" />,
            iconBg: "bg-purple-100",
            barPct: creditsPct,
            barColor: creditsPct >= 80 ? "bg-purple-500" : creditsPct >= 60 ? "bg-yellow-500" : "bg-red-500",
        },
        {
            label: "At-Risk Students",
            value: `${data.high_risk_count + data.moderate_risk_count}`,
            sub: `${data.high_risk_count} High · ${data.moderate_risk_count} Medium`,
            badge: data.high_risk_count > 0 ? "Action Needed" : "Monitored",
            badgeColor: data.high_risk_count > 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700",
            icon: <AlertTriangle size={18} className="text-orange-500" />,
            iconBg: "bg-orange-100",
            barPct: Math.min(100, ((data.high_risk_count + data.moderate_risk_count) / Math.max(1, data.total_students)) * 100),
            barColor: "bg-orange-500",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                            {card.icon}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
                            {card.badge}
                        </span>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500">{card.label}</p>
                        <p className="mt-0.5 text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${card.barColor}`}
                            style={{ width: `${Math.max(2, card.barPct)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
