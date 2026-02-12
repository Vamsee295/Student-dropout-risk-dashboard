"use client";

import { CheckCircle, School, AlertTriangle, Play } from "lucide-react";
import { MLMetricCard } from "@/components/risk-analysis/MLMetricCard";
import { FeatureImportanceChart } from "@/components/risk-analysis/FeatureImportanceChart";
import { RiskProbabilityChart } from "@/components/risk-analysis/RiskProbabilityChart";
import { AtRiskStudentsTable } from "@/components/risk-analysis/AtRiskStudentsTable";

export default function RiskAnalysisPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            ML Risk Analysis Insights
          </h2>
          <p className="text-sm font-medium text-gray-500">
            detailed breakdown of predictive model performance and key risk drivers for the current semester.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Play size={16} fill="currentColor" />
          Run New Analysis
        </button>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <MLMetricCard
          title="Model Accuracy"
          value="94%"
          trend="+2%"
          trendDirection="up"
          subtitle="Based on validation set of 500 records"
          icon={CheckCircle}
          iconColor="text-blue-600 bg-blue-50"
          progress={94}
          highlightColor="text-gray-900"
        />
        <MLMetricCard
          title="Students Analyzed"
          value="2,450"
          subtitle="Across 12 different departments"
          icon={School}
          iconColor="text-blue-600 bg-blue-50"
          highlightColor="text-gray-900"
        />
        <MLMetricCard
          title="High Risk Alerts"
          value="128"
          trend="+15 new"
          trendDirection="down" // Red color for bad trend (more alerts)
          subtitle="since last week"
          icon={AlertTriangle}
          iconColor="text-red-600 bg-red-50"
          highlightColor="text-gray-900"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 h-full">
        <div className="h-full">
          <FeatureImportanceChart />
        </div>
        <div className="h-full">
          <RiskProbabilityChart />
        </div>
      </section>

      <section>
        <AtRiskStudentsTable />
      </section>
    </div>
  );
}
