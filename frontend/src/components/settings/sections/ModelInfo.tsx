"use client";

import { Download, Activity, Cpu, Database, CheckCircle, RefreshCcw } from "lucide-react";

export function ModelInfo() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Model Transparency</h2>
                <p className="text-sm text-gray-500">
                    Technical details about the machine learning model powering the risk predictions.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                            <Cpu size={14} /> Model Type
                        </div>
                        <div className="text-lg font-bold text-gray-900">Random Forest Classifier</div>
                        <div className="text-xs text-gray-500 mt-1">v2.4.1 (Ensemble)</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                            <Activity size={14} /> Validation Accuracy
                        </div>
                        <div className="text-lg font-bold text-emerald-600">94.2%</div>
                        <div className="text-xs text-gray-500 mt-1">F1-Score: 0.91</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                            <Database size={14} /> Training Dataset
                        </div>
                        <div className="text-lg font-bold text-gray-900">45,200 Records</div>
                        <div className="text-xs text-gray-500 mt-1">Historical Data (2018-2024)</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                            <RefreshCcw size={14} /> Last Trained
                        </div>
                        <div className="text-lg font-bold text-gray-900">Feb 10, 2026</div>
                        <div className="text-xs text-gray-500 mt-1">14:30 PM UTC</div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-bold text-gray-900 mb-4">Fairness & Bias Check</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                <span className="font-semibold">Demographic Parity</span>
                            </div>
                            <span className="font-bold">Passed</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                <span className="font-semibold">Equal Opportunity Difference</span>
                            </div>
                            <span className="font-bold">&lt; 0.05 (Passed)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 justify-end">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
                    <Download size={16} />
                    Download Model Card (PDF)
                </button>
            </div>
        </div>
    );
}
