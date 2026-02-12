"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { Save, Loader2 } from "lucide-react";
import { useState } from "react";

export function GeneralSettings() {
    const { general, updateGeneral, isLoading, setIsLoading } = useSettingsStore();
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setHasChanges(false);
        // Add toast notification logic here (omitted for brevity)
    };

    const handleChange = (key: string, value: string) => {
        updateGeneral({ [key]: value });
        setHasChanges(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
                <p className="text-sm text-gray-500">
                    Configure institution-level settings and defaults.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Institution Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Institution Name</label>
                        <input
                            type="text"
                            value={general.institutionName}
                            onChange={(e) => handleChange('institutionName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Time Zone</label>
                        <select
                            value={general.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                        >
                            <option value="EST (UTC-5)">Eastern Standard Time (UTC-5)</option>
                            <option value="PST (UTC-8)">Pacific Standard Time (UTC-8)</option>
                            <option value="GMT (UTC+0)">Greenwich Mean Time (UTC+0)</option>
                            <option value="IST (UTC+5:30)">Indian Standard Time (UTC+5:30)</option>
                        </select>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Current Academic Year</label>
                        <select
                            value={general.academicYear}
                            onChange={(e) => handleChange('academicYear', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        >
                            <option>2024-2025</option>
                            <option>2025-2026</option>
                            <option>2026-2027</option>
                        </select>
                    </div>

                    {/* Default Semester */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Current Semester</label>
                        <select
                            value={general.semester}
                            onChange={(e) => handleChange('semester', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        >
                            <option>Fall 2025</option>
                            <option>Spring 2026</option>
                            <option>Summer 2026</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Data Refresh Frequency</label>
                        <div className="flex gap-4">
                            {['realtime', 'daily', 'weekly'].map((freq) => (
                                <label key={freq} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="refresh"
                                        checked={general.refreshFrequency === freq}
                                        onChange={() => handleChange('refreshFrequency', freq)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600 capitalize">{freq}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Controls how often the dashboard fetches new data from the SIS/LMS integrations.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all ${hasChanges && !isLoading
                            ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
