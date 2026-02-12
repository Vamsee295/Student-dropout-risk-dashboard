"use client";

import { Info } from "lucide-react";

const features = [
    { label: "Attendance Rate", value: 0.85 },
    { label: "Mid-term Grades", value: 0.72 },
    { label: "LMS Logins", value: 0.64 },
    { label: "Financial Aid Status", value: 0.45 },
    { label: "Commute Distance", value: 0.20 },
];

export function FeatureImportanceChart() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Feature Importance</h3>
                    <p className="text-xs text-slate-500">Top risk drivers influencing the model</p>
                </div>
                <Info size={16} className="text-slate-400" />
            </div>

            <div className="flex flex-col gap-5">
                {features.map((f) => (
                    <div key={f.label}>
                        <div className="mb-1 flex justify-between text-xs font-bold text-slate-700">
                            <span>{f.label}</span>
                            <span>{f.value.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${f.value * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
