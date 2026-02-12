"use client";

import { MoreHorizontal } from "lucide-react";

interface InterventionColumnProps {
    title: string;
    count: number;
    color: "orange" | "blue" | "emerald";
    children: React.ReactNode;
}

export function InterventionColumn({ title, count, color, children }: InterventionColumnProps) {
    const getDotColor = () => {
        switch (color) {
            case "orange": return "bg-orange-400";
            case "blue": return "bg-blue-500";
            case "emerald": return "bg-emerald-500";
            default: return "bg-gray-400";
        }
    };

    return (
        <div className="flex flex-col h-full min-w-[320px] bg-gray-50/50 rounded-xl p-2">
            <div className="flex items-center justify-between px-2 py-3 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${getDotColor()}`}></span>
                    <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-gray-200 text-xs font-bold text-gray-600">{count}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4 custom-scrollbar">
                {children}
            </div>
        </div>
    );
}
