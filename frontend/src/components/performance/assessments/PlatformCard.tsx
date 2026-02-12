"use client";

import { Trophy, Info } from "lucide-react";

interface PlatformCardProps {
    title: string;
    score?: number | string;
    level?: number;
    isEmpty?: boolean;
}

export function PlatformCard({ title, score, level, isEmpty }: PlatformCardProps) {
    return (
        <div className="flex flex-col h-full rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {isEmpty ? (
                    <div className="flex items-center justify-center h-full text-xs font-medium text-gray-300">
                        No {title.replace("Neo-", "")} Courses Taken
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="relative">
                            <div className="absolute -top-3 left-0 text-[10px] text-gray-400 font-medium bg-white px-1">
                                Your Score
                            </div>
                            <div className="text-4xl font-bold text-gray-900">{score}</div>
                            <div className="absolute inset-0 bg-blue-50/30 -z-10 blur-xl rounded-full w-20 h-20 -translate-x-4 -translate-y-4"></div>
                        </div>

                        {level !== undefined && (
                            <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                                <span>Level {level}</span>
                                <Info size={12} className="text-gray-300" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
