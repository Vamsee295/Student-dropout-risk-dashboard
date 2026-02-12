"use client";

import { LogIn, Clock, CheckSquare, Download, Calendar } from "lucide-react";
import { MetricCard } from "@/components/engagement/MetricCard";
import { ActivityHeatmap } from "@/components/engagement/ActivityHeatmap";
import { EffortChart } from "@/components/engagement/EffortChart";
import { AtRiskList } from "@/components/engagement/AtRiskList";

export default function EngagementPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Student Engagement Overview
                    </h1>
                    <p className="text-sm text-slate-500">
                        Track digital participation and identify at-risk students based on LMS activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Calendar size={16} />
                        Fall Semester 2025
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                    title="Avg. Login Rate"
                    value="84%"
                    subValue="Vs. previous 30 days"
                    trend="5%"
                    trendDirection="up"
                    icon={LogIn}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <MetricCard
                    title="Avg. Time Spent"
                    value="4.2h"
                    subValue="Per student / week"
                    trend="1.2h"
                    trendDirection="up"
                    icon={Clock}
                    iconBgColor="bg-purple-50"
                    iconColor="text-purple-600"
                />
                <MetricCard
                    title="Assignment Completion"
                    value="92%"
                    subValue="Total submissions rate"
                    trend="3%"
                    trendDirection="up"
                    icon={CheckSquare}
                    iconBgColor="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
            </div>

            {/* Heatmap Row */}
            <ActivityHeatmap />

            {/* Bottom Row: Charts & Risk List */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <EffortChart />
                </div>
                <div className="lg:col-span-1">
                    <AtRiskList />
                </div>
            </div>
        </div>
    );
}
