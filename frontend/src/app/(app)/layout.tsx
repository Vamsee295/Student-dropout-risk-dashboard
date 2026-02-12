"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Search, Bell, Calendar } from "lucide-react";

const pathTitleMap: Record<string, string> = {
    "/dashboard": "Institutional Health Dashboard",
    "/students": "Student Directory",
    "/courses": "Course Performance",
    "/analytics": "Deep Analytics",
    "/alerts": "Critical Alerts",
    "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
    if (pathname.startsWith("/students/")) {
        return "Student Profile";
    }
    return pathTitleMap[pathname] ?? "Dashboard";
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-neutral-900">
            <Sidebar activePath={pathname} />

            <div className="ml-64 flex min-h-screen flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {getPageTitle(pathname)}
                        </h1>
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                            <Calendar size={14} className="text-slate-500" />
                            This Semester
                            <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-1 text-slate-400"
                            >
                                <path
                                    d="M1 1L5 5L9 1"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-80 rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            >
                                <Bell size={20} />
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            >
                                <Calendar size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}

