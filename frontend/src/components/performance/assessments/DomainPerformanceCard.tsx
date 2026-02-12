"use client";

import { TrendingUp } from "lucide-react";

interface DomainPerformanceCardProps {
    title: string;
    attended: number;
    solved?: number;
    score: number | string;
    accuracy?: string; // e.g., "97.05%"
    minorAttended?: number; // for Projects
}

export function DomainPerformanceCard({
    title,
    attended,
    solved,
    score,
    accuracy,
    minorAttended,
}: DomainPerformanceCardProps) {
    return (
        <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">{title}</h3>

            <div className="flex gap-12 mb-8">
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {title === "Projects" ? "Major Attended" : "Questions Attended"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{attended}</p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {title === "Projects" ? "Minor Attended" : "Solved Correctly"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {title === "Projects" ? minorAttended : solved}
                    </p>
                </div>
            </div>

            <div className="flex items-end justify-between mt-auto">
                <div className="relative">
                    <div className="absolute -top-3 left-0 text-[10px] text-gray-400 font-medium bg-white px-1">
                        Your Score
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{score}</div>
                </div>

                {accuracy && (
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Accuracy</p>
                        <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-emerald-500">{accuracy}</span>
                            <TrendingUp size={16} className="text-emerald-400 mt-1" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
