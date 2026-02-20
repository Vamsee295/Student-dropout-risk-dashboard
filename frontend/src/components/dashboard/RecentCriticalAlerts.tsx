"use client";

import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

interface AlertItemProps {
    name: string;
    avatar: string;
    time: string;
    title: string;
    description: string;
    actions: { label: string; primary?: boolean; href?: string }[];
    isCritical?: boolean;
}

function AlertItem({ name, avatar, time, title, description, actions, isCritical }: AlertItemProps) {
    return (
        <div className={`relative pl-4 mb-8 last:mb-0 ${isCritical ? "before:bg-red-500" : "before:bg-amber-500"} before:absolute before:left-0 before:top-2 before:h-full before:w-[2px] before:rounded-full`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                        {avatar.includes("/") ? <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" /> : avatar}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">{name}</h4>
                    </div>
                </div>
                <span className="text-xs text-gray-400">{time}</span>
            </div>

            <div className="mt-2">
                <p className={`text-sm font-bold ${isCritical ? "text-red-600" : "text-amber-600"}`}>
                    {title}
                </p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-3 flex gap-2">
                {actions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href || "#"}
                        className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${action.primary
                            ? "bg-black text-white hover:bg-neutral-800"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {action.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

export function RecentCriticalAlerts() {
    const [alerts, setAlerts] = useState<AlertItemProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await apiClient.get('/students/all');
                const students = response.data;

                const highRiskStudents = students
                    .filter((s: any) => s.riskStatus === 'High Risk' || s.riskStatus === 'Moderate Risk')
                    .sort((a: any, b: any) => parseFloat(b.riskValue) - parseFloat(a.riskValue))
                    .slice(0, 4); // Top 4 at-risk students

                const alertsData = highRiskStudents.map((student: any) => ({
                    name: student.name,
                    avatar: student.avatar,
                    time: student.lastInteraction,
                    title: student.riskStatus === 'High Risk' ? 'Critical Risk Detected' : 'Elevated Risk Warning',
                    description: `AI prediction shows ${student.riskValue} dropout risk. Attendance: ${student.attendance}%, Engagement: ${student.engagementScore}%.`,
                    actions: [
                        { label: "Send Email", href: `mailto:${student.id}@university.edu` },
                        { label: "Inform Parent", primary: true, href: "#" }
                    ],
                    isCritical: student.riskStatus === 'High Risk'
                }));

                setAlerts(alertsData);
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">Loading alerts...</div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Critical Alerts</h3>
                <Link href="/students" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Link>
            </div>

            <div className="space-y-1">
                {alerts.map((alert, index) => (
                    <AlertItem key={index} {...alert} />
                ))}
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Load older alerts <ChevronDown className="h-4 w-4" />
            </button>
        </div>
    );
}
