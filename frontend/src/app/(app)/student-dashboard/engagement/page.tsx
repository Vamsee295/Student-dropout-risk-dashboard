"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { MyActivityHeatmap } from "@/components/engagement/MyActivityHeatmap";
import { EngagementMetricCards } from "@/components/engagement/EngagementMetricCards";

export default function StudentEngagementPage() {
    return (
        <div className="space-y-8 relative pb-10">
            {/* Header Section */}
            <section className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                        My Engagement & Activity
                    </h2>
                    <p className="text-base text-gray-500 max-w-2xl">
                        Track your digital participation and learning progress.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
                        <span>📅 Fall Semester 2023</span>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section>
                <EngagementMetricCards />
            </section>

            {/* Digital Footprint Heatmap */}
            <section>
                <MyActivityHeatmap />
            </section>

            {/* Additional Encouragement */}
            <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="font-bold text-indigo-900 mb-2">Improving Your Engagement</h3>
                <p className="text-sm text-indigo-700 mb-4">
                    Students with consistent activity (3+ days a week) are 40% more likely to achieve an A grade.
                    Try to log in everyday to check for announcements and assignments.
                </p>
            </section>
        </div>
    );
}
