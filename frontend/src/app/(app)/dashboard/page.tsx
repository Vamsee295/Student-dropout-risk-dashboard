"use client";

import { Users, AlertTriangle, Clock, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DropoutRiskTrend } from "@/components/dashboard/DropoutRiskTrend";
import { RiskDistribution } from "@/components/dashboard/RiskDistribution";
import { InterventionStatus } from "@/components/dashboard/InterventionStatus";
import { RecentCriticalAlerts } from "@/components/dashboard/RecentCriticalAlerts";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Students"
                    value="12,450"
                    icon={<Users size={20} />}
                    trend={{ value: "+2.4%", label: "vs last semester", direction: "up" }}
                    actionLabel="View enrollment details"
                />
                <StatCard
                    title="High Risk Students"
                    value="842"
                    icon={<AlertTriangle size={20} className="text-red-500" />}
                    trend={{
                        value: "+12%",
                        label: "critical increase",
                        direction: "down",
                    }}
                    highlight={true}
                    actionLabel="Review at-risk list"
                />
                <StatCard
                    title="Avg Attendance"
                    value="88%"
                    icon={<Clock size={20} className="text-amber-500" />}
                    trend={{ value: "-1.5%", label: "below target", direction: "down" }}
                    actionLabel="Analyze attendance"
                />
                <StatCard
                    title="Avg Engagement"
                    value="7.2/10"
                    icon={<Activity size={20} className="text-emerald-500" />}
                    trend={{ value: "+0.3", label: "improving", direction: "up" }}
                    actionLabel="Check engagement report"
                />
            </section>

            {/* Main Charts Area */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-6">
                    <DropoutRiskTrend />
                    <div className="grid gap-6 md:grid-cols-2">
                        <RiskDistribution />
                        <InterventionStatus />
                    </div>
                </div>

                {/* Right Column (Alerts) */}
                <div className="lg:col-span-1">
                    <RecentCriticalAlerts />
                </div>
            </section>
        </div>
    );
}

