"use client";

import { useState, useEffect } from "react";
import { CheckCircle, School, AlertTriangle, Play } from "lucide-react";
import { NoDataGate } from "@/components/NoDataGate";
import { MLMetricCard } from "@/components/risk-analysis/MLMetricCard";
import { FeatureImportanceChart } from "@/components/risk-analysis/FeatureImportanceChart";
import { RiskProbabilityChart } from "@/components/risk-analysis/RiskProbabilityChart";
import { AtRiskStudentsTable } from "@/components/risk-analysis/AtRiskStudentsTable";
import apiClient from "@/lib/api";

export default function RiskAnalysisPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchMetrics = () => {
    setLoading(true);
    apiClient.get('/analytics/ml-metrics')
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error('Failed to fetch ML metrics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMetrics(); }, []);

  const handleRunAnalysis = async () => {
    setRunning(true);
    try {
      await apiClient.post('/faculty/recalculate');
      fetchMetrics();
    } catch {
      console.error("Failed to run analysis");
      fetchMetrics();
    } finally {
      setRunning(false);
    }
  };

  return (
    <NoDataGate>
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
        <button
          onClick={handleRunAnalysis}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {running ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          {running ? "Running..." : "Run New Analysis"}
        </button>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <MLMetricCard
              title="Model Accuracy"
              value={`${metrics?.model_accuracy || 0}%`}
              trend={`F1: ${metrics?.f1_score || 0}%`}
              trendDirection="up"
              subtitle={`Trained on ${metrics?.training_samples || 0} samples`}
              icon={CheckCircle}
              iconColor="text-blue-600 bg-blue-50"
              progress={metrics?.model_accuracy || 0}
              highlightColor="text-gray-900"
            />
            <MLMetricCard
              title="Students Analyzed"
              value={metrics?.total_students_analyzed?.toLocaleString() || "0"}
              subtitle={`Across ${metrics?.department_count || 0} departments`}
              icon={School}
              iconColor="text-blue-600 bg-blue-50"
              highlightColor="text-gray-900"
            />
            <MLMetricCard
              title="High Risk Alerts"
              value={metrics?.high_risk_alerts?.toString() || "0"}
              subtitle="Flagged by ML model"
              icon={AlertTriangle}
              iconColor="text-red-600 bg-red-50"
              highlightColor="text-gray-900"
            />
          </>
        )}
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
    </NoDataGate>
  );
}
