"use client";

import { TrendingUp, Award } from "lucide-react";

interface Metric {
    label: string;
    value: number | string;
}

interface DomainPerformanceCardProps {
    title: string;
    metrics: Metric[];
    score: number;
    accuracy?: number; // Percentage
    trendColor?: string; // 'green' | 'orange' | 'red'
}

export function DomainPerformanceCard({ title, metrics, score, accuracy }: DomainPerformanceCardProps) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {metrics.map((m) => (
                    <div key={m.label}>
                        <p className="text-[10px] font-medium text-slate-500">{m.label}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Footer: Score and Accuracy */}
            <div className="mt-8 flex items-end justify-between border-t border-slate-50 pt-4">
                <div>
                    <p className="text-xs font-medium text-slate-400">Your Score</p>
                    <div className="relative mt-1">
                        <p className="text-3xl font-bold text-blue-600">{score}</p>
                        <div className="absolute -left-3 -top-2 h-16 w-16 opacity-[0.03]">
                            <Award size={64} />
                        </div>
                    </div>
                </div>

                {accuracy !== undefined && (
                    <div className="text-right">
                        <p className="text-[10px] font-medium text-slate-500">Accuracy</p>
                        <div className="flex items-center justify-end gap-1">
                            <p className={`text-xl font-bold ${accuracy > 80 ? 'text-green-600' : accuracy > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                {accuracy}%
                            </p>
                        </div>
                        {/* Mini trend line visual (svg) */}
                        <svg className="ml-auto mt-1 h-4 w-12" viewBox="0 0 50 15" fill="none" stroke="currentColor">
                            <path d="M0 10 C10 10, 15 5, 25 5 S 40 10, 50 2" strokeWidth="2" className={accuracy > 80 ? 'text-green-400' : 'text-orange-400'} strokeLinecap="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
