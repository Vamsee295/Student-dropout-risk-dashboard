"use client";

import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DropoutRiskTrendChart } from "@/components/dashboard/DropoutRiskTrendChart";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { InterventionStatus } from "@/components/dashboard/InterventionStatus";
import { RecentCriticalAlerts } from "@/components/dashboard/RecentCriticalAlerts";

export default function DashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-1">
      {/* Page Header is handled in layout.tsx, but we can add specific dashboard actions here if needed */}

      <DashboardMetrics />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <DropoutRiskTrendChart />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <RiskDistributionChart />
            <InterventionStatus />
          </div>
        </div>

        {/* Sidebar Area - Right 1 Column */}
        <div className="lg:col-span-1">
          <RecentCriticalAlerts />
        </div>
      </div>
    </div>
  );
}
