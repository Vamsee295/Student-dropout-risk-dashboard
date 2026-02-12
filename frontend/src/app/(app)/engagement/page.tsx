"use client";

import { Download } from "lucide-react";
import { EngagementMetricCards } from "@/components/engagement/EngagementMetricCards";
import { LMSHeatmapChart } from "@/components/engagement/LMSHeatmapChart";
import { EffortOutputChart } from "@/components/engagement/EffortOutputChart";
import { HighRiskStudentList } from "@/components/engagement/HighRiskStudentList";

export default function EngagementPage() {
    return (
        <div className="space-y-6">
            <section className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">
                        Student Engagement Overview
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                        Track digital participation and identify at-risk students based on LMS activity.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
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
                    <HighRiskStudentList />
                </div>
            </section>
        </div>
    );
}
