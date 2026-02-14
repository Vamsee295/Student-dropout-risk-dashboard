"use client";

import { Users, AlertTriangle, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Update MetricCardProps to include href
interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendLabel: string;
    trendDirection: "up" | "down";
    trendColor: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    actionLabel: string;
    href: string;
    borderColor?: string;
}

function MetricCard({
    title,
    value,
    trend,
    trendLabel,
    trendDirection,
    trendColor,
    icon: Icon,
    iconColor,
    iconBg,
    actionLabel,
    href,
    borderColor = "border-transparent",
}: MetricCardProps) {
    return (
        <div className={`rounded-xl border bg-white p-5 shadow-sm ${borderColor}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>

                    <div className="mt-2 flex items-center text-sm">
                        <span
                            className={`font-medium ${trendDirection === "up" ? "text-emerald-600" : "text-red-600"
                                }`}
                        >
                            {trendDirection === "up" ? "↗" : "↘"} {trend}
                        </span>
                        <span className="ml-2 text-gray-500">{trendLabel}</span>
                    </div>
                </div>
                <div className={`rounded-lg p-2 ${iconBg}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
                <Link
                    href={href}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    {actionLabel} <span className="ml-1">→</span>
                </Link>
            </div>
        </div>
    );
}

export function DashboardMetrics() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                // Fetch overview analytics
                const overviewRes = await fetch(`${API_URL}/api/analytics/overview`);
                const overviewData = await overviewRes.json();

                // Fetch students for attendance/engagement calculation
                const studentsRes = await fetch(`${API_URL}/api/students/all`);
                const studentsData = await studentsRes.json();

                setOverview(overviewData);
                setStudents(studentsData);
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">Loading metrics...</div>;
    }

    // Calculate attendance and engagement from real student data with null safety
    const avgAttendance = students && students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s?.attendance || 0), 0) / students.length)
        : 0;

    const avgEngagement = students && students.length > 0
        ? (students.reduce((sum, s) => sum + (s?.engagementScore || 0), 0) / students.length / 10).toFixed(1)
        : "0.0";

    const metrics = [
        {
            title: "Total Students",
            value: overview?.total_students?.toLocaleString() || "0",
            trend: "+2.4%",
            trendLabel: "vs last semester",
            trendDirection: "up" as const,
            trendColor: "text-emerald-600",
            icon: Users,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
            actionLabel: "View enrollment details",
            href: "/students",
        },
        {
            title: "High Risk Students",
            value: overview?.high_risk_count?.toString() || "0",
            trend: `${overview?.high_risk_percentage?.toFixed(1) || 0}%`,
            trendLabel: "of total students",
            trendDirection: "up" as const,
            trendColor: "text-red-600",
            icon: AlertTriangle,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
            actionLabel: "Review at-risk list",
            href: "/risk-analysis",
            borderColor: "border-l-4 border-l-red-500",
        },
        {
            title: "Avg Attendance",
            value: `${avgAttendance}%`,
            trend: avgAttendance >= 85 ? "+1.5%" : "-1.5%",
            trendLabel: avgAttendance >= 85 ? "above target" : "below target",
            trendDirection: avgAttendance >= 85 ? "up" as const : "down" as const,
            trendColor: avgAttendance >= 85 ? "text-emerald-600" : "text-red-600",
            icon: Clock,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
            actionLabel: "Analyze attendance",
            href: "/reports",
        },
        {
            title: "Avg Engagement",
            value: `${avgEngagement}/10`,
            trend: "+0.3",
            trendLabel: "improving",
            trendDirection: "up" as const,
            trendColor: "text-emerald-600",
            icon: Activity,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50",
            actionLabel: "Check engagement report",
            href: "/engagement",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
            ))}
        </div>
    );
}
