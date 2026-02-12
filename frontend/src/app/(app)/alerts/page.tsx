"use client";

import { AlertsHeader } from "@/components/alerts/AlertsHeader";
import { MLMetricCard } from "@/components/alerts/MLMetricCard";
import { FeatureImportanceChart } from "@/components/alerts/FeatureImportanceChart";
import { RiskDistributionChart } from "@/components/alerts/RiskDistributionChart";
import { AtRiskStudentsTable } from "@/components/alerts/AtRiskStudentsTable";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <AlertsHeader />

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <MLMetricCard
          title="Model Accuracy"
          value="94%"
          trend="+2%"
          subtext="Based on validation set of 500 records"
          type="accuracy"
        />
        <MLMetricCard
          title="Students Analyzed"
          value="2,450"
          subtext="Across 12 different departments"
          type="analyzed"
        />
        <MLMetricCard
          title="High Risk Alerts"
          value="128"
          trend="15 new"
          subtext=""
          type="alerts"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FeatureImportanceChart />
        <RiskDistributionChart />
      </div>

      {/* Table Row */}
      <AtRiskStudentsTable />
    </div>
  );
}
