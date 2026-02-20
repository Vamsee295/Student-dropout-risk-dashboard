"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { Save, Loader2, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import apiClient from "@/lib/api";

export function RiskModelSettings() {
    const { riskThresholds, featureWeights, updateRiskThresholds, updateFeatureWeights, isLoading, setIsLoading } = useSettingsStore();
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                apiClient.put('/settings', { section: 'riskThresholds', data: riskThresholds }),
                apiClient.put('/settings', { section: 'featureWeights', data: featureWeights }),
            ]);
        } catch {
            // Persisted locally via Zustand persist middleware
        } finally {
            setIsLoading(false);
            setHasChanges(false);
        }
    };

    const handleThresholdChange = (key: string, value: number) => {
        updateRiskThresholds({ [key]: value });
        setHasChanges(true);
    };

    const handleWeightChange = (key: string, value: number) => {
        updateFeatureWeights({ [key]: value });
        setHasChanges(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Risk Model Configuration</h2>
                <p className="text-sm text-gray-500">
                    Fine-tune the ML model parameters and risk classification thresholds.
                </p>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>
                    Changes to these settings will trigger a system-wide recalculation of student risk scores.
                    This process may take a few minutes to reflect on the dashboard.
                </p>
            </div>

            {/* Section A: Risk Thresholds */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">A</span>
                    Risk Thresholds
                </h3>

                <div className="space-y-8">
                    {/* High Risk Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-gray-700">High Risk Probability Threshold</label>
                            <span className="text-sm font-bold text-red-600">{riskThresholds.highRisk}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="95"
                            value={riskThresholds.highRisk}
                            onChange={(e) => handleThresholdChange('highRisk', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <p className="text-xs text-gray-500">Students with a predicted probability above this value will be flagged as "High Risk".</p>
                    </div>

                    {/* Attendance Warning */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-gray-700">Attendance Warning Threshold</label>
                            <span className="text-sm font-bold text-orange-600">{riskThresholds.attendanceWarning}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="90"
                            value={riskThresholds.attendanceWarning}
                            onChange={(e) => handleThresholdChange('attendanceWarning', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>

                    {/* LMS Inactivity */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-gray-700">LMS Inactivity Trigger (Days)</label>
                            <span className="text-sm font-bold text-gray-900">{riskThresholds.lmsInactivity} Days</span>
                        </div>
                        <input
                            type="range"
                            min="3"
                            max="30"
                            value={riskThresholds.lmsInactivity}
                            onChange={(e) => handleThresholdChange('lmsInactivity', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                    </div>
                </div>
            </div>

            {/* Section B: Feature Weights */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">B</span>
                    Feature Weight Adjustment (0.0 - 1.0)
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(featureWeights).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()} Weight
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={value}
                                    onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                                />
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${value * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info size={14} />
                        <span>Weights are automatically normalized during model inference.</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end sticky bottom-4">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${hasChanges && !isLoading
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Configuration
                </button>
            </div>
        </div>
    );
}
