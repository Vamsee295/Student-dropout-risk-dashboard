"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, GraduationCap, AlertTriangle } from "lucide-react";

interface MLMetricCardProps {
    title: string;
    value: string | number;
    trend?: string; // e.g. "+2%"
    subtext: string;
    type: "accuracy" | "analyzed" | "alerts";
}

export function MLMetricCard({ title, value, trend, subtext, type }: MLMetricCardProps) {
    return (
        <div className="flex select-none flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-500">{title}</span>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    type === "accuracy" ? "bg-blue-100 text-blue-600" :
                        type === "analyzed" ? "bg-indigo-100 text-indigo-600" :
                            "bg-red-100 text-red-600"
                )}>
                    {type === "accuracy" && <CheckCircle2 size={16} />}
                    {type === "analyzed" && <GraduationCap size={16} />}
                    {type === "alerts" && <AlertTriangle size={16} />}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{value}</span>
                    {trend && (
                        <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            type === "alerts" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                        )}>
                            {type === "alerts" ? "+" : "~"}{trend}
                        </span>
                    )}
                </div>

                {/* Progress Bar for Accuracy */}
                {type === "accuracy" && (
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-[94%] rounded-full bg-blue-600" />
                    </div>
                )}

                <p className="mt-3 text-xs text-slate-400">
                    {type === "alerts" ? <span className="font-bold text-red-500">+15 new</span> : null}
                    {type === "alerts" ? " since last week" : subtext}
                </p>
            </div>
        </div>
    );
}
