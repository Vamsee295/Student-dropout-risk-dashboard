"use client";

import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    subValue?: string;
    trend: string;
    trendDirection: "up" | "down";
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
}

export function MetricCard({
    title,
    value,
    subValue,
    trend,
    trendDirection,
    icon: Icon,
    iconBgColor,
    iconColor,
}: MetricCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                        <span
                            className={`flex items-center gap-0.5 text-xs font-bold ${trendDirection === "up"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                } rounded px-1.5 py-0.5`}
                        >
                            {trendDirection === "up" ? (
                                <ArrowUpRight size={12} />
                            ) : (
                                <ArrowDownRight size={12} />
                            )}
                            {trend}
                        </span>
                    </div>
                    {subValue && (
                        <p className="mt-1 text-xs font-medium text-slate-500">{subValue}</p>
                    )}
                </div>
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}
                >
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}
