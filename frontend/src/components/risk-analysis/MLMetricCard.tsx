"use client";

import { LucideIcon } from "lucide-react";

interface MLMetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendDirection?: "up" | "down" | "neutral";
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    progress?: number; // 0-100
    highlightColor?: string; // Tailwind class for text color e.g., "text-red-600"
}

export function MLMetricCard({
    title,
    value,
    trend,
    trendDirection = "neutral",
    subtitle,
    icon: Icon,
    iconColor = "text-blue-600",
    progress,
    highlightColor = "text-gray-900",
}: MLMetricCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className={`text-3xl font-bold ${highlightColor}`}>{value}</span>
                            {trend && (
                                <span className={`text-xs font-bold ${trendDirection === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {trend}
                                </span>
                            )}
                        </div>
                    </div>
                    {Icon && (
                        <div className={`rounded-full p-2 bg-gray-50 ${iconColor}`}>
                            <Icon size={20} />
                        </div>
                    )}
                </div>

                {progress !== undefined && (
                    <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                        <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {subtitle && (
                <p className="mt-4 text-xs font-medium text-gray-500">{subtitle}</p>
            )}
        </div>
    );
}
