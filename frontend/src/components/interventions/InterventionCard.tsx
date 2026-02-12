"use client";

import { AlertTriangle, TrendingDown, Clock, CheckCircle2, MoreHorizontal, User, Calendar } from "lucide-react";

export interface InterventionData {
    id: string;
    studentName: string;
    studentId: string;
    grade: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    title: string;
    description: string;
    meta: {
        owner?: string;
        date?: string;
        suggestion?: string;
        outcome?: string;
    };
}

interface InterventionCardProps {
    data: InterventionData;
}

export function InterventionCard({ data }: InterventionCardProps) {
    const isPending = data.status === 'Pending';
    const isInProgress = data.status === 'In Progress';
    const isCompleted = data.status === 'Completed';

    // Styles based on status
    const cardBorder = isPending
        ? "border-l-4 border-l-amber-400"
        : isInProgress
            ? "border-l-4 border-l-blue-500"
            : "border-l-4 border-l-emerald-500";

    const riskBadge = data.riskLevel === 'High'
        ? "bg-red-50 text-red-600 border-red-100"
        : data.riskLevel === 'Medium'
            ? "bg-orange-50 text-orange-600 border-orange-100"
            : "bg-emerald-50 text-emerald-600 border-emerald-100";

    return (
        <div className={`relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${cardBorder}`}>
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <span className="text-sm font-bold">{data.studentName.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{data.studentName}</h4>
                        <p className="text-[10px] text-slate-500">Grade {data.grade} • ID #{data.studentId}</p>
                    </div>
                </div>
                {!isCompleted && (
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${riskBadge}`}>
                        {data.riskLevel} Risk
                    </span>
                )}
                {isCompleted && (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                )}
            </div>

            {/* Content Body */}
            <div className={`mb-3 flex-1 rounded-lg p-3 ${isPending ? 'bg-amber-50' : isInProgress ? 'bg-slate-50' : 'bg-emerald-50'}`}>
                {isPending && (
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="flex-shrink-0 text-amber-500" size={14} />
                        <div>
                            <p className="text-xs font-bold text-slate-800">{data.title}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{data.description}</p>
                        </div>
                    </div>
                )}

                {isInProgress && (
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Plan</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{data.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{data.description}</p>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                <User size={12} />
                                {data.meta.owner}
                            </div>
                            <div className="flex items-center gap-1.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                <Calendar size={12} />
                                {data.meta.date}
                            </div>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <div>
                        <p className="text-xs font-bold text-emerald-800">{data.title}</p>
                        <p className="mt-1 text-[11px] text-emerald-700">{data.description}</p>
                        <div className="mt-2 flex justify-between text-[10px] text-emerald-600/80">
                            <span>Resolved: {data.meta.date}</span>
                            <span>By: {data.meta.owner}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Suggested Action (Pending only) */}
            {isPending && (
                <div className="mb-3 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Suggested:</span> {data.meta.suggestion}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto flex gap-2">
                {isPending && (
                    <button className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Schedule
                    </button>
                )}
                {isInProgress && (
                    <>
                        <button className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                            Log Note
                        </button>
                        <button className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                            Complete
                        </button>
                    </>
                )}
            </div>

            {/* Options Dot */}
            <button className="absolute right-4 top-4 text-slate-300 hover:text-slate-600">
                <MoreHorizontal size={16} />
            </button>
        </div>
    );
}
