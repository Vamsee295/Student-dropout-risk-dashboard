"use client";

import { Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

interface Feature {
    name: string;
    importance: number;
}

export function FeatureImportanceChart() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/analytics/feature-importance')
            .then(res => {
                const data = (res.data || []).map((f: { feature: string; importance: number }) => ({
                    name: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    importance: f.importance,
                }));
                setFeatures(data.length > 0 ? data : [
                    { name: "No model trained yet", importance: 0 }
                ]);
            })
            .catch(() => setFeatures([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

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
