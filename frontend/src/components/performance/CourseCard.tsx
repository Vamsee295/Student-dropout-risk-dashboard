"use client";

import { MoreHorizontal } from "lucide-react";

export interface CourseCardProps {
    id: string;
    name: string;
    code: string;
    professor: string;
    riskStatus: "Red Flag" | "Warning" | "Stable";
    riskRate: string; // e.g. "18%"
    avgAttendance: string; // e.g. "72%"
    avgGrade: string; // e.g. "2.4"
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case "Red Flag":
            return "bg-red-50 text-red-600 border-red-100";
        case "Warning":
            return "bg-orange-50 text-orange-600 border-orange-100";
        default:
            return "bg-green-50 text-green-600 border-green-100";
    }
};

export function CourseCard({ data }: { data: CourseCardProps }) {
    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-3 flex items-start justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusStyles(data.riskStatus)}`}>
                    {data.riskStatus}
                </span>
                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{data.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{data.code} • {data.professor}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-3">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Risk Rate</p>
                    <p className={`text-sm font-bold ${data.riskStatus === 'Red Flag' ? 'text-red-600' : 'text-gray-700'}`}>{data.riskRate}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Avg Attd.</p>
                    <p className="text-sm font-bold text-gray-700">{data.avgAttendance}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Avg Grade</p>
                    <p className="text-sm font-bold text-gray-700">{data.avgGrade}</p>
                </div>
            </div>
        </div>
    );
}
