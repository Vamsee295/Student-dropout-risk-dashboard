"use client";

import { useState, useEffect } from "react";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { AcademicKPICards } from "@/components/performance/AcademicKPICards";
import { GPATrendChart } from "@/components/performance/GPATrendChart";
import { PerformanceRiskScore } from "@/components/performance/PerformanceRiskScore";
import { CourseRadarChart } from "@/components/performance/CourseRadarChart";
import { EarlyWarningPanel } from "@/components/performance/EarlyWarningPanel";
import { AIInsightCard } from "@/components/performance/AIInsightCard";
import { ComparativeAnalytics } from "@/components/performance/ComparativeAnalytics";
import { InterventionTracking } from "@/components/performance/InterventionTracking";
// Legacy sections (preserved)
import { AlertBanner } from "@/components/performance/AlertBanner";
import { PlatformCard } from "@/components/performance/assessments/PlatformCard";
import { SolvedQuestionsCard } from "@/components/performance/assessments/SolvedQuestionsCard";
import { DomainPerformanceCard } from "@/components/performance/assessments/DomainPerformanceCard";
import { exportToCSV } from "@/utils/exportUtils";
import apiClient from "@/lib/api";

// Sections for navigation
const SECTIONS = [
    { id: "overview", label: "📊 Overview" },
    { id: "trends", label: "📈 Trends" },
    { id: "deep-dive", label: "📚 Deep Dive" },
    { id: "risk", label: "🚨 Risk & Alerts" },
    { id: "actions", label: "🛠 Actions" },
];

export default function PerformancePage() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(`${currentYear - 1} - ${currentYear}`);
    const [department, setDepartment] = useState("All Departments");
    const [activeSection, setActiveSection] = useState("overview");
    const [legacyData, setLegacyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams();
        if (department && department !== "All Departments") {
            params.append("department", department);
        }
        apiClient.get(`/performance/aggregate?${params.toString()}`)
            .then(r => r.data)
            .then(setLegacyData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [department]);

    const handleExport = () => {
        if (!legacyData) return;
        exportToCSV([{
            "Neo-PAT Score": legacyData.neo_pat_score,
            "Neo-PAT Level": legacyData.neo_pat_level,
            "Coding Score": legacyData.coding_stats?.your_score,
            "Coding Accuracy": `${legacyData.coding_stats?.accuracy}%`,
            "MCQ Score": legacyData.mcq_stats?.your_score,
            "MCQ Accuracy": `${legacyData.mcq_stats?.accuracy}%`,
            "Academic Year": year,
            "Department": department,
        }], `performance_report_${year.replace(/\s/g, "")}`);
    };

    // Scrolling navigation
    const scrollTo = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(`section-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <PerformanceHeader
                selectedYear={year}
                onYearChange={setYear}
                selectedDept={department}
                onDeptChange={setDepartment}
                onExport={handleExport}
            />

            {/* ── Sticky section navigation ── */}
            <div className="sticky top-0 z-10 -mx-2 bg-white/90 backdrop-blur-sm px-2 pt-2 pb-1 border-b border-gray-100">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => scrollTo(s.id)}
                            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${activeSection === s.id
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════
                Section 1: Overview — KPI Cards + AI Insight + Risk Gauge
            ═══════════════════════════════════════ */}
            <section id="section-overview" className="scroll-mt-20 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">📊 Academic Overview</h2>
                    <p className="text-sm text-gray-500 mt-0.5">At-a-glance KPIs for academic health across the cohort.</p>
                </div>

                <AcademicKPICards department={department} />

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <AIInsightCard department={department} />
                    </div>
                    <div>
                        <PerformanceRiskScore department={department} />
                    </div>
                </div>
            </section>

            <div className="border-t border-gray-200" />

            {/* ═══════════════════════════════════════
                Section 2: Performance Trends
            ═══════════════════════════════════════ */}
            <section id="section-trends" className="scroll-mt-20 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">📈 Performance Trend Analysis</h2>
                    <p className="text-sm text-gray-500 mt-0.5">GPA over time, rolling averages, and subject-level diagnostics.</p>
                </div>

                <GPATrendChart department={department} />

                <ComparativeAnalytics department={department} />
            </section>

            <div className="border-t border-gray-200" />

            {/* ═══════════════════════════════════════
                Section 3: Course Deep Dive
            ═══════════════════════════════════════ */}
            <section id="section-deep-dive" className="scroll-mt-20 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">📚 Course-Level Deep Dive</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Per-course radar charts, attendance, marks, and student vs class comparisons.</p>
                </div>

                <CourseRadarChart department={department} />
            </section>

            <div className="border-t border-gray-200" />

            {/* ═══════════════════════════════════════
                Section 4: Risk & Early Warnings
            ═══════════════════════════════════════ */}
            <section id="section-risk" className="scroll-mt-20 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">🚨 Risk Indicators & Early Warnings</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Automatic flags for GPA drops, failed subjects, credit shortfalls, and more.</p>
                </div>

                <AlertBanner />

                <EarlyWarningPanel department={department} />
            </section>

            <div className="border-t border-gray-200" />

            {/* ═══════════════════════════════════════
                Section 5: Actions — Skill Assessments + Interventions
            ═══════════════════════════════════════ */}
            <section id="section-actions" className="scroll-mt-20 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">🛠 Actions & Interventions</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Skill assessments, coding profiles, and intervention tracking.</p>
                </div>

                <InterventionTracking department={department} />

                {/* Legacy skill assessments section preserved */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Skill Assessments & Coding Profile</h3>
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                            <div className="lg:col-span-3">
                                <PlatformCard
                                    title="Neo-PAT"
                                    score={legacyData?.neo_pat_score || 0}
                                    level={parseInt(legacyData?.neo_pat_level?.split(" ")[1] || "0")}
                                />
                            </div>
                            <div className="lg:col-span-4">
                                <PlatformCard title="Neo-Colab" isEmpty />
                            </div>
                            <div className="lg:col-span-5 h-[200px]">
                                <SolvedQuestionsCard
                                    easy={legacyData?.solved_questions?.easy}
                                    medium={legacyData?.solved_questions?.medium}
                                    hard={legacyData?.solved_questions?.hard}
                                    totalSolved={legacyData?.solved_questions?.total_solved || 0}
                                    totalQuestions={legacyData?.solved_questions?.total_questions || 0}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <DomainPerformanceCard
                                title="Coding"
                                attended={legacyData?.coding_stats?.questions_attended || 0}
                                solved={legacyData?.coding_stats?.solved_correctly || 0}
                                score={legacyData?.coding_stats?.your_score || 0}
                                accuracy={`${legacyData?.coding_stats?.accuracy || 0}%`}
                            />
                            <DomainPerformanceCard
                                title="Projects"
                                attended={legacyData?.projects_stats?.major_attended || 0}
                                minorAttended={legacyData?.projects_stats?.minor_attended || 0}
                                score={legacyData?.projects_stats?.your_score || 0}
                            />
                            <DomainPerformanceCard
                                title="MCQ"
                                attended={legacyData?.mcq_stats?.questions_attended || 0}
                                solved={legacyData?.mcq_stats?.solved_correctly || 0}
                                score={legacyData?.mcq_stats?.your_score || 0}
                                accuracy={`${legacyData?.mcq_stats?.accuracy || 0}%`}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
