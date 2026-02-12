"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";

const AT_RISK = [
    { id: "#8821", name: "Sarah J.", risk: 92, avatar: "bg-orange-100 text-orange-600" },
    { id: "#9932", name: "Mike T.", risk: 88, avatar: "bg-blue-100 text-blue-600" },
    { id: "#7741", name: "Jessica L.", risk: 85, avatar: "bg-purple-100 text-purple-600" },
];

export function AtRiskList() {
    return (
        <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                        <h3 className="text-base font-bold text-slate-900">High Risk Students</h3>
                    </div>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {AT_RISK.map((student) => (
                    <div key={student.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${student.avatar}`}>
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">{student.name}</div>
                                <div className="text-[10px] text-slate-400">ID: {student.id}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                {student.risk}%
                            </span>
                            <button className="rounded p-1 hover:bg-slate-200 text-slate-400">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
