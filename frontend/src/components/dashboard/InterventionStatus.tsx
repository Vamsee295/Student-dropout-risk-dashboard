"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

interface InterventionItemProps {
    label: string;
    percentage: number;
    color: string;
}

function InterventionItem({ label, percentage, color }: InterventionItemProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className={`font-bold ${color.replace('bg-', 'text-')}`}>{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function InterventionStatus() {
    const [metrics, setMetrics] = useState<{ label: string; percentage: number; color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/analytics/interventions')
            .then(res => {
                const { pending = [], in_progress = [], completed = [] } = res.data;
                const total = pending.length + in_progress.length + completed.length;
                if (total === 0) {
                    setMetrics([
                        { label: "Pending", percentage: 0, color: "bg-amber-500" },
                        { label: "In Progress", percentage: 0, color: "bg-blue-600" },
                        { label: "Completed", percentage: 0, color: "bg-emerald-500" },
                    ]);
                } else {
                    setMetrics([
                        { label: "Pending", percentage: Math.round((pending.length / total) * 100), color: "bg-amber-500" },
                        { label: "In Progress", percentage: Math.round((in_progress.length / total) * 100), color: "bg-blue-600" },
                        { label: "Completed", percentage: Math.round((completed.length / total) * 100), color: "bg-emerald-500" },
                    ]);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Intervention Status</h3>

            <div className="space-y-6">
                {metrics.map((m) => (
                    <InterventionItem key={m.label} label={m.label} percentage={m.percentage} color={m.color} />
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
                <Link href="/interventions" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Go to Intervention Board <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </div>
    );
}
