"use client";

import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { AlertBanner } from "@/components/performance/AlertBanner";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { CorrelationChart } from "@/components/performance/CorrelationChart";
import { CourseList } from "@/components/performance/CourseList";
import { PlatformCard } from "@/components/performance/assessments/PlatformCard";
import { SolvedQuestionsCard } from "@/components/performance/assessments/SolvedQuestionsCard";
import { DomainPerformanceCard } from "@/components/performance/assessments/DomainPerformanceCard";

export default function PerformancePage() {
    return (
        <div className="space-y-8">
            <PerformanceHeader />

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
