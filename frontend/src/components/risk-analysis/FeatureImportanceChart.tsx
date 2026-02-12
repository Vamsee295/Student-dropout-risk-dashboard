"use client";

import { Info } from "lucide-react";

const features = [
    { name: "Attendance Rate", importance: 0.85 },
    { name: "Mid-term Grades", importance: 0.72 },
    { name: "LMS Logins", importance: 0.64 },
    { name: "Financial Aid Status", importance: 0.45 },
    { name: "Commute Distance", importance: 0.20 },
];

export function FeatureImportanceChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Feature Importance</h3>
                    <p className="text-xs text-gray-500">Top risk drivers influencing the model</p>
                </div>
                <Info size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>

            <div className="space-y-5">
                {features.map((feature) => (
                    <div key={feature.name}>
                        <div className="mb-1 flex justify-between text-sm font-semibold text-gray-700">
                            <span>{feature.name}</span>
                            <span>{feature.importance.toFixed(2)}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${feature.importance * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
