"use client";

import { Save, Loader2, Zap } from "lucide-react";
import { useState } from "react";

export function InterventionPolicy() {
    const [isLoading, setIsLoading] = useState(false);
    const [autoAssignment, setAutoAssignment] = useState(true);
    const [escalationDays, setEscalationDays] = useState(7);

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Intervention Policies</h2>
                <p className="text-sm text-gray-500">
                    Define automated rules for creating and managing interventions.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8">
                {/* Auto-Creation Rule */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm">Automated Intervention Creation</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Automatically create a "Needs Assessment" intervention when a student's risk probability exceeds:
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <input
                                    type="number"
                                    defaultValue={80}
                                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-center"
                                />
                                <span className="font-bold text-gray-600">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Auto-Assign Advisor</h4>
                            <p className="text-xs text-gray-500">Assign the student's primary academic advisor automatically.</p>
                        </div>
                        <button
                            onClick={() => setAutoAssignment(!autoAssignment)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${autoAssignment ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${autoAssignment ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Escalation Policy</h4>
                            <p className="text-xs text-gray-500">Escalate to Department Head if intervention status is 'Pending' for more than:</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={escalationDays}
                                onChange={(e) => setEscalationDays(Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded font-medium text-center"
                            />
                            <span className="text-sm font-medium text-gray-600">Days</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Policies
                </button>
            </div>
        </div>
    );
}
