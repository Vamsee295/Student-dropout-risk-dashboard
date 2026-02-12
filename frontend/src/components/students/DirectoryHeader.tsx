"use client";

import { UserPlus, Users, Download } from "lucide-react";
import Link from "next/link";

export function DirectoryHeader() {
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
                            <button className="rounded px-3 py-1 bg-white text-gray-900 shadow-sm">
                                Admin
                            </button>
                            <button className="rounded px-3 py-1 text-gray-500 hover:text-gray-900">
                                Advisor
                            </button>
                            <button className="rounded px-3 py-1 text-gray-500 hover:text-gray-900">
                                Faculty
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage student data and monitor dropout risk factors.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <UserPlus className="h-4 w-4" />
                        Assign Advisor
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Users className="h-4 w-4" />
                        Schedule Group Counseling
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        Export Selected
                    </button>
                </div>
            </div>
        </div>
    );
}
