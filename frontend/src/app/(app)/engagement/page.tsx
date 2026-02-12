"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { EngagementMetricCards } from "@/components/engagement/EngagementMetricCards";
import { LMSHeatmapChart } from "@/components/engagement/LMSHeatmapChart";
import { EffortOutputChart } from "@/components/engagement/EffortOutputChart";
import { HighRiskStudentList } from "@/components/engagement/HighRiskStudentList";
import { NewInterventionModal } from "@/components/interventions/NewInterventionModal";
import { SuccessAnimation } from "@/components/interventions/SuccessAnimation";
import { InterventionCardProps } from "@/components/interventions/InterventionCard";
import { exportToCSV } from "@/utils/exportUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EngagementPage() {
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<{ name: string; id: string; risk: number } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [engagementData, setEngagementData] = useState<any>(null);

    useEffect(() => {
        fetchEngagementData();
    }, []);

    const fetchEngagementData = async () => {
        try {
            const [overviewResp, highRiskResp] = await Promise.all([
                fetch(`${API_URL}/api/engagement/overview`),
                fetch(`${API_URL}/api/engagement/high-risk-students`)
            ]);

            const overview = await overviewResp.json();
            const highRisk = await highRiskResp.json();

            setEngagementData({
                overview,
                highRisk: highRisk.students || []
            });
        } catch (error) {
            console.error("Error fetching engagement data:", error);
        }
    };

    const handleIntervene = (student: { name: string; id: string; risk: number }) => {
        setSelectedStudent(student);
        setIsInterventionModalOpen(true);
    };

    const handleConfirmIntervention = (intervention: Partial<InterventionCardProps>) => {
        // In a real app, we would save this to the backend.
        // For now, we just show the success animation.
        console.log("Created intervention:", intervention);
        setShowSuccess(true);
    };

    const handleExportReport = () => {
        if (!engagementData) {
            alert("No data available to export");
            return;
        }

        const { overview, highRisk } = engagementData;

        // Create comprehensive engagement report
        const reportData = [
            {
                "Metric": "Average Login Rate",
                "Value": `${Math.round(overview.avg_login_rate)}%`,
                "Trend": `${overview.login_rate_trend > 0 ? '+' : ''}${overview.login_rate_trend}%`
            },
            {
                "Metric": "Average Time Spent (per week)",
                "Value": `${overview.avg_time_spent.toFixed(1)} hours`,
                "Trend": `${overview.time_spent_trend > 0 ? '+' : ''}${overview.time_spent_trend.toFixed(1)}h`
            },
            {
                "Metric": "Assignment Completion Rate",
                "Value": `${Math.round(overview.assignment_completion)}%`,
                "Trend": `${overview.completion_trend > 0 ? '+' : ''}${overview.completion_trend}%`
            },
            {},
            { "Metric": "HIGH-RISK STUDENTS", "Value": "", "Trend": "" },
            ...highRisk.map((student: any) => ({
                "Student ID": student.id,
                "Student Name": student.name,
                "Risk Level": `${student.risk_percentage}%`,
                "Status": student.risk_level
            }))
        ];

        const timestamp = new Date().toISOString().split('T')[0];
        exportToCSV(reportData, `engagement_report_${timestamp}`);
    };

    return (
        <div className="space-y-6 relative">
            {showSuccess && (
                <SuccessAnimation
                    message="Intervention Created"
                    subMessage={`Successfully flagged ${selectedStudent?.name} for support.`}
                    onComplete={() => setShowSuccess(false)}
                />
            )}

            <NewInterventionModal
                isOpen={isInterventionModalOpen}
                onClose={() => setIsInterventionModalOpen(false)}
                onConfirm={handleConfirmIntervention}
                initialData={selectedStudent ? {
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.id,
                    riskLevel: selectedStudent.risk > 80 ? "High Risk" : "Medium Risk"
                } : undefined}
            />

            <section className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">
                        Student Engagement Overview
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        Track digital participation and identify at-risk students based on LMS activity.
                    </p>
                </div>
                <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                    <Download size={16} />
                    Export Report
                </button>
            </section>

            <section>
                <EngagementMetricCards />
            </section>

            <section>
                <LMSHeatmapChart />
            </section>

            <section className="grid gap-6 lg:grid-cols-12">
                {/* Effort Chart - 8/12 */}
                <div className="lg:col-span-8 h-[350px]">
                    <EffortOutputChart />
                </div>

                {/* High Risk List - 4/12 */}
                <div className="lg:col-span-4 h-full">
                    <HighRiskStudentList onIntervene={handleIntervene} />
                </div>
            </section>
        </div>
    );
}
