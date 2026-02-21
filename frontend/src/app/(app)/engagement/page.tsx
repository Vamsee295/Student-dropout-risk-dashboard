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
import apiClient from "@/lib/api";

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
                apiClient.get('/engagement/overview'),
                apiClient.get('/engagement/high-risk-students')
            ]);

            setEngagementData({
                overview: overviewResp.data,
                highRisk: highRiskResp.data.students || []
            });
        } catch (error) {
            console.error("Error fetching engagement data:", error);
        }
    };

    const handleIntervene = (student: { name: string; id: string; risk: number }) => {
        setSelectedStudent(student);
        setIsInterventionModalOpen(true);
    };

    const handleConfirmIntervention = async (intervention: Partial<InterventionCardProps>) => {
        try {
            await apiClient.post('/faculty/interventions', {
                student_id: selectedStudent?.id || intervention.studentId?.replace('#', ''),
                intervention_type: 'academic_support',
                notes: `${intervention.alertTitle}: ${intervention.alertDescription}`,
            });
        } catch (e) {
            console.error("Failed to create intervention:", e);
        }
        setShowSuccess(true);
    };

    const handleExportReport = () => {
        if (!engagementData) {
            console.warn("No data available to export");
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
        <div className="space-y-8 relative pb-10">
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

            {/* Header Section */}
            <section className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                        Student Engagement Overview
                    </h2>
                    <p className="text-base text-gray-500 max-w-2xl">
                        Track digital participation and identify at-risk students based on LMS activity.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
                        <span>Current Semester</span>
                    </div>
                    <button
                        onClick={handleExportReport}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </section>

            {/* Metrics Section */}
            <section>
                <EngagementMetricCards />
            </section>

            {/* Digital Footprint Heatmap */}
            <section>
                <LMSHeatmapChart />
            </section>

            {/* Charts Grid */}
            <section className="grid gap-6 lg:grid-cols-12">
                {/* Effort Chart - 7/12 */}
                <div className="lg:col-span-7 h-[400px]">
                    <EffortOutputChart />
                </div>

                {/* High Risk List - 5/12 */}
                <div className="lg:col-span-5 h-full min-h-[400px]">
                    <HighRiskStudentList onIntervene={handleIntervene} />
                </div>
            </section>
        </div>
    );
}
