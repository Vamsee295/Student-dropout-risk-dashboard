import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: string;
        label: string;
        direction: "up" | "down" | "neutral";
    };
    highlight?: boolean; // For the "High Risk Students" red accent
    actionLabel?: string;
    onAction?: () => void;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    highlight,
    actionLabel,
    onAction,
}: StatCardProps) {
    return (
        <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${highlight ? "border-l-4 border-l-red-500" : "border-slate-100"
                }`}
        >
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                        {icon}
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{value}</span>
                </div>

                {trend && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                        <span
                            className={`flex items-center gap-0.5 ${trend.direction === "up"
                                    ? "text-emerald-600"
                                    : trend.direction === "down"
                                        ? "text-red-600"
                                        : "text-slate-500"
                                }`}
                        >
                            {trend.direction === "up" && <ArrowUpRight size={14} />}
                            {trend.direction === "down" && <ArrowDownRight size={14} />}
                            {trend.direction === "neutral" && <Minus size={14} />}
                            {trend.value}
                        </span>
                        <span className="text-slate-500">{trend.label}</span>
                    </div>
                )}
            </div>

            {actionLabel && (
                <div className="mt-6 pt-4">
                    <button
                        onClick={onAction}
                        className={`flex items-center gap-1 text-xs font-bold transition-colors ${highlight
                                ? "text-red-600 hover:text-red-700"
                                : "text-blue-600 hover:text-blue-700"
                            }`}
                    >
                        {actionLabel}
                        <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
