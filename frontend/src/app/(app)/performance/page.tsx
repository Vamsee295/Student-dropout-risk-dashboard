"use client";

import { useState, useEffect } from "react";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { AlertBanner } from "@/components/performance/AlertBanner";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { CorrelationChart } from "@/components/performance/CorrelationChart";
import { CourseList } from "@/components/performance/CourseList";
import { PlatformCard } from "@/components/performance/assessments/PlatformCard";
import { SolvedQuestionsCard } from "@/components/performance/assessments/SolvedQuestionsCard";
import { DomainPerformanceCard } from "@/components/performance/assessments/DomainPerformanceCard";
import { exportToCSV } from "@/utils/exportUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PerformanceData {
    neo_pat_score: number;
    neo_pat_level: string;
    coding_stats: {
        questions_attended: number;
        solved_correctly: number;
        your_score: number;
        accuracy: number;
    };
    mcq_stats: {
        questions_attended: number;
        solved_correctly: number;
        your_score: number;
        accuracy: number;
    };
    projects_stats: {
        major_attended: number;
        minor_attended: number;
        your_score: number;
    };
    solved_questions: {
        easy: { solved: number; total: number };
        medium: { solved: number; total: number };
        hard: { solved: number; total: number };
        total_solved: number;
        total_questions: number;
    };
}

export default function PerformancePage() {
    const [year, setYear] = useState("2023 - 2024");
    const [department, setDepartment] = useState("All Departments");
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformanceData();
    }, [department]); // Refetch when department changes

    const fetchPerformanceData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (department && department !== "All Departments") {
                params.append("department", department);
            }

            const response = await fetch(`${API_URL}/api/performance/aggregate?${params.toString()}`);
            const data = await response.json();
            setPerformanceData(data);
        } catch (error) {
            console.error("Error fetching performance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!performanceData) return;

        const data = [{
            "Neo-PAT Score": performanceData.neo_pat_score,
            "Neo-PAT Level": performanceData.neo_pat_level,
            "Coding Score": performanceData.coding_stats.your_score,
            "Coding Accuracy": `${performanceData.coding_stats.accuracy}%`,
            "MCQ Score": performanceData.mcq_stats.your_score,
            "MCQ Accuracy": `${performanceData.mcq_stats.accuracy}%`,
            "Projects": performanceData.projects_stats.major_attended,
            "Academic Year": year,
            "Department": department
        }];

        exportToCSV(data, `performance_report_${year.replace(/\s/g, '')}`);
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="text-center py-8">Loading performance data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PerformanceHeader
                selectedYear={year}
                onYearChange={setYear}
                selectedDept={department}
                onDeptChange={setDepartment}
                onExport={handleExport}
            />

            {/* Assessment/Skills Section */}
            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Skill Assessments & Coding Profile</h2>
                <div className="space-y-6">
                    {/* Top Row: Platforms & Solved Stats */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                        <div className="lg:col-span-3">
                            <PlatformCard
                                title="Neo-PAT"
                                score={performanceData?.neo_pat_score || 0}
                                level={parseInt(performanceData?.neo_pat_level?.split(' ')[1] || '0')}
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <PlatformCard title="Neo-Colab" isEmpty />
                        </div>
                        <div className="lg:col-span-5 h-[200px]">
                            <SolvedQuestionsCard
                                easy={performanceData?.solved_questions.easy}
                                medium={performanceData?.solved_questions.medium}
                                hard={performanceData?.solved_questions.hard}
                                totalSolved={performanceData?.solved_questions.total_solved || 0}
                                totalQuestions={performanceData?.solved_questions.total_questions || 0}
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Domains */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <DomainPerformanceCard
                            title="Coding"
                            attended={performanceData?.coding_stats.questions_attended || 0}
                            solved={performanceData?.coding_stats.solved_correctly || 0}
                            score={performanceData?.coding_stats.your_score || 0}
                            accuracy={`${performanceData?.coding_stats.accuracy || 0}%`}
                        />
                        <DomainPerformanceCard
                            title="Projects"
                            attended={performanceData?.projects_stats.major_attended || 0}
                            minorAttended={performanceData?.projects_stats.minor_attended || 0}
                            score={performanceData?.projects_stats.your_score || 0}
                        />
                        <DomainPerformanceCard
                            title="MCQ"
                            attended={performanceData?.mcq_stats.questions_attended || 0}
                            solved={performanceData?.mcq_stats.solved_correctly || 0}
                            score={performanceData?.mcq_stats.your_score || 0}
                            accuracy={`${performanceData?.mcq_stats.accuracy || 0}%`}
                        />
                    </div>
                </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Course Performance Section */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Course & Subject Diagnostics</h2>
                    <AlertBanner />
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Metrics - 3/12 */}
                    <div className="lg:col-span-3">
                        <PerformanceMetrics department={department} />
                    </div>

                    {/* Correlation Chart - 9/12 */}
                    <div className="lg:col-span-9 h-[320px]">
                        <CorrelationChart />
                    </div>
                </div>

                <div>
                    <CourseList />
                </div>
            </section>
        </div>
    );
}
