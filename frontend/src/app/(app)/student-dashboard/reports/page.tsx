"use client";

import { RiskProfileHeader } from "@/components/reports/RiskProfileHeader";
import { MetricCardGrid } from "@/components/reports/MetricCardGrid";
import { AttendanceChart } from "@/components/reports/AttendanceChart";
import { EngagementRadarChart } from "@/components/reports/EngagementRadarChart";
import { RecommendedActions } from "@/components/reports/RecommendedActions";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Individual Student Risk Profile</h2>
      </section>

      <section>
        <RiskProfileHeader />
      </section>

      <section>
        <MetricCardGrid />
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Charts - 8/12 grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="h-[350px]">
            <AttendanceChart />
          </div>
          <div className="h-[350px]">
            <EngagementRadarChart />
          </div>
        </div>

        {/* Right Column: Actions & Events - 4/12 grid */}
        <div className="lg:col-span-4 h-full">
          <RecommendedActions />
        </div>
      </section>
    </div>
  );
}
