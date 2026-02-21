"use client";

import { UserPlus, Users, Download } from "lucide-react";
import Link from "next/link";

type ViewRole = "Admin" | "Advisor" | "Faculty";

interface DirectoryHeaderProps {
    onAssignAdvisor: () => void;
    onGroupCounseling: () => void;
    onExport: () => void;
    selectedCount: number;
    activeRole?: ViewRole;
    onRoleChange?: (role: ViewRole) => void;
}

export function DirectoryHeader({ onAssignAdvisor, onGroupCounseling, onExport, selectedCount, activeRole = "Admin", onRoleChange }: DirectoryHeaderProps) {
    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            <nav className="text-xs font-medium text-gray-500">
                <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                    Dashboard
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-semibold">Student Directory</span>
            </nav>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Student Directory
                        </h1>
                        <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
                            {(["Admin", "Advisor", "Faculty"] as ViewRole[]).map(role => (
                                <button
                                    key={role}
                                    onClick={() => onRoleChange?.(role)}
                                    className={`rounded px-3 py-1 transition-all ${activeRole === role ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage student data and monitor dropout risk factors.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={onAssignAdvisor}
                        disabled={selectedCount === 0}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UserPlus className="h-4 w-4" />
                        Assign Advisor
                    </button>
                    <button
                        onClick={onGroupCounseling}
                        disabled={selectedCount === 0}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Users className="h-4 w-4" />
                        Schedule Group Counseling
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export Selected
                    </button>
                </div>
            </div>
        </div>
    );
}
