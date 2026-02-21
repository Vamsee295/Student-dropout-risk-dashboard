"use client";

import { Moon, Sun, Sidebar as SidebarIcon, Layout } from "lucide-react";
import { useState, useEffect } from "react";

export function AppearanceSettings() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") return localStorage.getItem("app-theme") || "light";
        return "light";
    });
    const [sidebarMode, setSidebarMode] = useState(() => {
        if (typeof window !== "undefined") return localStorage.getItem("app-sidebar") || "expanded";
        return "expanded";
    });

    useEffect(() => {
        localStorage.setItem("app-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("app-sidebar", sidebarMode);
        window.dispatchEvent(new CustomEvent("sidebar-mode-change", { detail: sidebarMode }));
    }, [sidebarMode]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-500">
                    Customize the look and feel of the dashboard.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                {/* Theme Selector */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-3">Theme Preference</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500">
                                <Sun size={20} />
                            </div>
                            <span className={`font-bold text-sm ${theme === 'light' ? 'text-blue-700' : 'text-gray-600'}`}>Light Mode</span>
                        </button>

                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-blue-600 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-400">
                                <Moon size={20} />
                            </div>
                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-gray-600'}`}>Dark Mode</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar Mode */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-3">Sidebar Behavior</h3>
                    <div className="space-y-2">
                        <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <SidebarIcon size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Expanded (Default)</span>
                            </div>
                            <input
                                type="radio"
                                name="sidebar"
                                checked={sidebarMode === 'expanded'}
                                onChange={() => setSidebarMode('expanded')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Layout size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Compact</span>
                            </div>
                            <input
                                type="radio"
                                name="sidebar"
                                checked={sidebarMode === 'compact'}
                                onChange={() => setSidebarMode('compact')}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
