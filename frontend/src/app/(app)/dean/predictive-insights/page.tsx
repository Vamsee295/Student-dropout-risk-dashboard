"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import { Loader2, BrainCircuit, Target, Lightbulb } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line
} from "recharts";

export default function PredictiveInsights() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getPredictiveInsights().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
    if (!data) return <p className="text-gray-500 text-center mt-20">No ML predictive data available.</p>;

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit size={20} className="text-violet-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Predictive ML Insights</h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">AI-driven forecasts and policy recommendations based on XGBoost & SHAP</p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-violet-200 text-sm font-medium mb-1">Projected Dropout Rate</p>
                        <p className="text-4xl font-bold">{Math.round(data.projected_dropout_rate)}%</p>
                        <p className="text-xs text-violet-200 mt-2">Predicted for end of semester</p>
                    </div>
                    <Target className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                </div>

                <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb size={18} className="text-amber-500" /> Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                        {data.model_accuracy_note && (
                            <li className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                {data.model_accuracy_note}
                            </li>
                        )}
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                            Primary driver of student risk currently is <span className="font-semibold">{(data.top_risk_factors?.[0]?.feature || "attendance").replace(/_/g, " ")}</span>.
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            Focusing interventions on students in the 40-60% risk band yields the highest RTD (Return to Degree) probability.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SHAP Feature Importance */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-1">Global Feature Importance (SHAP)</h3>
                    <p className="text-xs text-gray-500 mb-4">What metrics drive the AI's risk predictions institution-wide?</p>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.top_risk_factors || []} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
                                <YAxis type="category" dataKey="feature" axisLine={false} tickLine={false} tick={{ fill: "#4B5563", fontSize: 11, fontWeight: 500 }} width={90} tickFormatter={(v) => v.replace(/_/g, " ").replace(/\b\w/g, (c: any) => c.toUpperCase())} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} cursor={{ fill: "#F3F4F6" }} />
                                <Bar dataKey="importance" name="Impact Score" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Prediction Curve / Threshold analysis */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Risk Probability Distribution Curve</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.risk_curve || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="risk_bucket" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                                <Line type="monotone" dataKey="student_count" name="Students" stroke="#EC4899" strokeWidth={3} dot={{ r: 3, fill: "#EC4899" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">Right skew indicates higher institutional risk.</p>
                </div>
            </div>
        </div>
    );
}
