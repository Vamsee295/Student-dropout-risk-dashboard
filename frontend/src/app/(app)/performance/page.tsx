"use client";

import { useState } from "react";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { AlertBanner } from "@/components/performance/AlertBanner";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { CorrelationChart } from "@/components/performance/CorrelationChart";
import { CourseList } from "@/components/performance/CourseList";
import { PlatformCard } from "@/components/performance/assessments/PlatformCard";
import { SolvedQuestionsCard } from "@/components/performance/assessments/SolvedQuestionsCard";
import { DomainPerformanceCard } from "@/components/performance/assessments/DomainPerformanceCard";

// Mock data for export
const PERFORMANCE_DATA = [
    { id: 101, name: "Intro to Macroeconomics", code: "ECON 101", risk: "High", attendance: "65%", grade: "1.8", dept: "CSE" },
    { id: 102, name: "Computer Science 101", code: "CS 101", risk: "Medium", attendance: "72%", grade: "2.5", dept: "CS IT" },
    { id: 103, name: "Linear Algebra", code: "MATH 201", risk: "Low", attendance: "78%", grade: "2.9", dept: "AI-DS" },
    { id: 104, name: "Physics I", code: "PHYS 101", risk: "Low", attendance: "92%", grade: "3.8", dept: "AEROSPACE" },
];

export default function PerformancePage() {
    const [year, setYear] = useState("2023 - 2024");
    const [department, setDepartment] = useState("All Departments");

    const handleExport = () => {
        // Filter data based on department (mocking year filter as data is static for now)
        const relevantData = department === "All Departments"
            ? PERFORMANCE_DATA
            : PERFORMANCE_DATA.filter(d => d.dept === department);

        // CSV Header
        const headers = ["Course Name", "Code", "Risk Status", "Attendance", "Grade", "Department", "Academic Year"];

        // CSV Rows
        const rows = relevantData.map(d => [
            d.name,
            d.code,
            d.risk,
            d.attendance,
            d.grade,
            d.dept,
            year
        ]);

        // Construct CSV String
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `performance_report_${year.replace(/\s/g, '')}_${department.replace(/\s/g, '_')}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                            <PlatformCard title="Neo-PAT" score={379} level={1} />
                        </div>
                        <div className="lg:col-span-4">
                            <PlatformCard title="Neo-Colab" isEmpty />
                        </div>
                        <div className="lg:col-span-5 h-[200px]">
                            <SolvedQuestionsCard />
                        </div>
                    </div>

                    {/* Bottom Row: Domains */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <DomainPerformanceCard
                            title="Coding"
                            attended={39}
                            solved={37}
                            score={379}
                            accuracy="97.05%"
                        />
                        <DomainPerformanceCard
                            title="Projects"
                            attended={0}
                            minorAttended={0}
                            score={0}
                        />
                        <DomainPerformanceCard
                            title="MCQ"
                            attended={80}
                            solved={37}
                            score={37}
                            accuracy="46.25%"
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
                        <PerformanceMetrics />
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
