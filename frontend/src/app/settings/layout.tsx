"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Settings Sidebar - Fixed Left */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen sticky top-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">ER</div>
                        <div className="leading-tight">
                            <div className="text-sm">EduRisk AI</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase">Admin Console</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <SettingsSidebar />
                </div>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin & Settings</h1>
                        <p className="text-xs text-gray-500">Student Dropout Risk Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">Admin User</div>
                            <div className="text-xs text-gray-500">System Administrator</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            AD
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
