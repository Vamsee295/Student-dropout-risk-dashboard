"use client";

import { Calendar, User, MoreHorizontal, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export interface InterventionCardProps {
    id: string;
    studentName: string;
    studentInitial: string; // e.g. "IC"
    studentId: string;
    grade: string;
    riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
    alertTitle: string;
    alertDescription: string;
    suggestedAction: string;
    actionPlan?: string;
    actionPlanDescription?: string;
    assignedTo?: string; // Name
    assignedToAvatar?: string; // URL
    dueDate?: string;
    status: "Pending" | "In Progress" | "Completed";
    resolvedDate?: string;
    resolvedBy?: string;
}

const getRiskColor = (risk: string) => {
    switch (risk) {
        case "High Risk": return "bg-red-50 text-red-600 border-red-100";
        case "Medium Risk": return "bg-orange-50 text-orange-600 border-orange-100";
        default: return "bg-green-50 text-green-600 border-green-100";
    }
};

const getStatusBorder = (status: string) => {
    switch (status) {
        case "Pending": return "border-l-orange-400";
        case "In Progress": return "border-l-blue-500";
        case "Completed": return "border-l-emerald-500";
        default: return "border-l-gray-200";
    }
};

export function InterventionCard({ data, onAssign }: { data: InterventionCardProps; onAssign?: (id: string) => void }) {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm border-l-4 ${getStatusBorder(data.status)} hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {data.studentInitial}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">{data.studentName}</h4>
                        <p className="text-[10px] text-gray-500">{data.grade} • ID #{data.studentId}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskColor(data.riskLevel)}`}>
                    {data.riskLevel}
                </span>
            </div>

            {/* Alert Content */}
            <div className={`rounded-lg p-3 mb-3 ${data.status === 'Completed' ? 'bg-emerald-50 border border-emerald-100' : 'bg-orange-50 border border-orange-100'}`}>
                {data.status === 'Completed' ? (
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <h5 className="font-bold text-emerald-800 text-xs">{data.alertTitle}</h5>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-orange-600" />
                        <h5 className="font-bold text-orange-800 text-xs">{data.alertTitle}</h5>
                    </div>
                )}
                <p className="text-[11px] text-gray-600 leading-snug">{data.alertDescription}</p>
            </div>

            {/* Suggested / Plan */}
            {data.status === 'Pending' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3">
                    <span>Suggested:</span>
                    <span className="text-gray-800">{data.suggestedAction}</span>
                </div>
            )}

            {data.status === 'In Progress' && (
                <div className="mb-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Action Plan</div>
                    <h5 className="font-bold text-gray-800 text-xs">{data.actionPlan}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{data.actionPlanDescription}</p>
                </div>
            )}

            {data.status === 'Completed' && (
                <div className="flex justify-between items-end mt-2 text-[10px] text-gray-400">
                    <span>Resolved: {data.resolvedDate}</span>
                    <span>By: {data.resolvedBy}</span>
                </div>
            )}

            {/* Footer Actions */}
            {data.status !== 'Completed' && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        {data.assignedTo && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <span className="h-4 w-4 rounded-full bg-gray-300"></span>
                                <span className="text-[10px] font-medium text-gray-600">{data.assignedTo}</span>
                            </div>
                        )}
                        {data.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <Calendar size={12} />
                                <span>{data.dueDate}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">

                        <button
                            onClick={() => data.status === 'Pending' && onAssign?.(data.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold hover:bg-blue-700 shadow-sm shadow-blue-200">
                            {data.status === 'Pending' ? 'Assign' : 'Complete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
