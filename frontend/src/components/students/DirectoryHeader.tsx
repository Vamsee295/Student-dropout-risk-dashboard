"use client";

import { UserPlus, Users, Download, ChevronRight } from "lucide-react";

export function DirectoryHeader() {
    return (
        <div className="space-y-6 bg-white p-8 pb-4 shadow-sm">
            {/* Breadcrumb & Title Row */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span>Dashboard</span>
                    <ChevronRight size={14} />
                    <span className="text-slate-900">Student Directory</span>
                </div>

                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Student Directory
                    </h1>
                    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button className="rounded-md bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                            Admin
                        </button>
                        <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900">
                            Advisor
                        </button>
                        <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900">
                            Faculty
                        </button>
                    </div>
                </div>

                <p className="text-sm text-slate-500">
                    Manage student data and monitor dropout risk factors.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <UserPlus size={16} />
                    Assign Advisor
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <Users size={16} />
                    Schedule Group Counseling
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                    <Download size={16} />
                    Export Selected
                </button>
            </div>
        </div>
    );
}
