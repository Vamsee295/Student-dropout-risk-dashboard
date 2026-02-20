"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { studentService, type RiskDetails } from "@/services/student";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Info, ShieldCheck, Clock } from "lucide-react";

export default function RiskStatusPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<RiskDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.student_id) {
                try {
                    const riskData = await studentService.getRisk(user.student_id);
                    setData(riskData);
                } catch (error) {
                    console.error("Failed to fetch risk data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShieldCheck size={48} className="mb-4 text-green-500" />
                <p className="text-lg font-medium">No risk data available.</p>
                <p className="text-sm">You appear to be in good standing!</p>
            </div>
        );
    }

    const isHighRisk = data.risk_level === "High Risk";
    const isModerateRisk = data.risk_level === "Moderate Risk";

    const riskColor = isHighRisk ? "red" : isModerateRisk ? "amber" : "green";
    const RiskIcon = isHighRisk ? AlertTriangle : isModerateRisk ? Info : ShieldCheck;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Risk Assessment</h1>
                <p className="text-gray-500">AI-powered analysis of your dropout risk factors.</p>
            </div>

            {/* Main Risk Card */}
            <div className={`p-8 rounded-2xl border flex flex-col items-center text-center ${isHighRisk ? 'bg-red-50 border-red-100' :
                isModerateRisk ? 'bg-amber-50 border-amber-100' :
                    'bg-green-50 border-green-100'
                }`}>
                <div className={`p-4 rounded-full mb-4 ${isHighRisk ? 'bg-red-200 text-red-700' :
                    isModerateRisk ? 'bg-amber-200 text-amber-700' :
                        'bg-green-200 text-green-700'
                    }`}>
                    <RiskIcon size={48} />
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${isHighRisk ? 'text-red-900' :
                    isModerateRisk ? 'text-amber-900' :
                        'text-green-900'
                    }`}>
                    {data.risk_level}
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {isHighRisk
                        ? "Your current academic metrics suggest a high risk of dropout. Immediate action is recommended."
                        : isModerateRisk
                            ? "You are showing some signs of academic struggle. Consider improving your attendance or grades."
                            : "You are consistent with your academic performance. Keep up the good work!"}
                </p>

                <div className="flex items-center gap-8 text-sm">
                    <div>
                        <p className="text-gray-500 uppercase text-xs font-semibold">Risk Probability</p>
                        <p className="text-xl font-bold text-gray-900">{data.risk_score.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-gray-500 uppercase text-xs font-semibold">Trend</p>
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                            {data.risk_trend === 'up' ? <TrendingUp size={16} className="text-red-600" /> : <TrendingDown size={16} className="text-green-600" />}
                            <span>{data.risk_trend === 'up' ? 'Worsening' : data.risk_trend === 'down' ? 'Improving' : 'Stable'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Importance (Explainability) */}
            {data.explanation && data.explanation.top_factors.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Info size={18} className="text-indigo-600" />
                        Key Risk Factors (AI Explanations)
                    </h3>
                    <div className="space-y-4">
                        {data.explanation.top_factors.map((factor, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">{formatFeatureName(factor.feature)}</span>
                                    <span className={`font-semibold ${factor.direction === 'negative' ? 'text-red-600' : 'text-green-600'}`}>
                                        {factor.direction === 'negative' ? 'Negative Impact' : 'Positive Impact'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${factor.direction === 'negative' ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(Math.abs(factor.impact) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    {getRecommendation(factor.feature, factor.direction)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Suggested Actions</h3>
                <div className="grid gap-3">
                    {isHighRisk && (
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangle size={18} className="text-red-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900 text-sm">Schedule a meeting with your advisor</p>
                                <p className="text-xs text-red-700">Discuss a recovery plan to improve your metrics.</p>
                            </div>
                        </div>
                    )}
                    {(isHighRisk || isModerateRisk) && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Clock size={18} className="text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900 text-sm">Improve class attendance</p>
                                <p className="text-xs text-blue-700">Aim for at least 75% attendance in all ongoing courses.</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <TrendingUp size={18} className="text-indigo-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-indigo-900 text-sm">Complete pending assignments</p>
                            <p className="text-xs text-indigo-700">Submit any overdue work to boost your engagement score.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helpers

function formatFeatureName(feature: string) {
    return feature
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getRecommendation(feature: string, direction: string) {
    if (direction === 'positive') return "This is helping reduce your risk level. Keep it up!";

    switch (feature) {
        case 'attendance_rate': return "Low attendance significantly increases dropout risk. Attend upcoming classes.";
        case 'academic_performance_index': return "Low grades in exams are a concern. Consider tutoring or extra study.";
        case 'engagement_score': return "Overall engagement is low. Participate more in class and submissions.";
        case 'login_gap_days': return "You haven't logged in recently. Stay active on the portal.";
        case 'failure_ratio': return "High failure rate detected. Focus on passing current subjects.";
        default: return "This factor is negatively impacting your risk score.";
    }
}
