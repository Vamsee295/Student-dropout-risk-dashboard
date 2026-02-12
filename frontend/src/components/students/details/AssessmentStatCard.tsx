"use client";

import { Info } from "lucide-react";

interface AssessmentStatCardProps {
    title: string;
    score?: number; // Optional, if not taken
    level?: number;
    subtext?: string; // "No Colab Courses Taken"
}

export function AssessmentStatCard({ title, score, level, subtext }: AssessmentStatCardProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>

            <div className="mt-6 flex flex-1 items-center justify-center">
                {subtext ? (
                    <p className="text-sm font-medium text-slate-300">{subtext}</p>
                ) : (
                    <div className="flex w-full items-end justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Your Score</p>
                            <div className="relative mt-2">
                                {/* Shield-like background placeholder (using div/border tricks for now) */}
                                <div className="absolute -left-2 top-1 h-14 w-12 opacity-5">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 w-full h-full"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" /></svg>
                                </div>
                                <span className="relative text-3xl font-bold text-slate-900">{score}</span>
                            </div>
                        </div>

                        {level && (
                            <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                                Level {level}
                                <Info size={12} className="text-slate-300" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
