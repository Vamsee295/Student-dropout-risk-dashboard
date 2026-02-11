import { Activity, AlertTriangle, Users2 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import type { FeatureImportanceItem } from "@/components/FeatureImportance";
import { FeatureImportance } from "@/components/FeatureImportance";
import type { RiskBandDatum } from "@/components/RiskBarChart";
import { RiskBarChart } from "@/components/RiskBarChart";

const FEATURE_DATA: FeatureImportanceItem[] = [
  { name: "Attendance Rate", importance: 0.85 },
  { name: "Mid-term Grades", importance: 0.72 },
  { name: "LMS Logins", importance: 0.64 },
  { name: "Financial Aid Status", importance: 0.45 },
  { name: "Commute Distance", importance: 0.2 },
];

const RISK_BANDS: RiskBandDatum[] = [
  { range: "0–20%", count: 320 },
  { range: "20–40%", count: 250 },
  { range: "40–60%", count: 180 },
  { range: "60–80%", count: 120 },
  { range: "80–100%", count: 60 },
];

const TOP_AT_RISK_STUDENTS = [
  {
    id: "JD-4521",
    name: "John Doe",
    riskScore: "98% Critical",
    primaryDriver: "Attendance < 50%",
    lastActivity: "2 days ago",
  },
  {
    id: "SM-3308",
    name: "Sarah Miller",
    riskScore: "92% High",
    primaryDriver: "No LMS login 7 days",
    lastActivity: "5 hours ago",
  },
  {
    id: "MK-2217",
    name: "Mike Khan",
    riskScore: "88% High",
    primaryDriver: "Assignments missing",
    lastActivity: "1 day ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Model Accuracy"
          value="94%"
          helperText="Based on validation set of 500 records."
          trendLabel="+2% vs last version"
          trendType="positive"
          icon={<Activity size={18} />}
        />
        <KpiCard
          title="Students Analyzed"
          value="2,450"
          helperText="Across 12 different departments."
          trendType="neutral"
          icon={<Users2 size={18} />}
        />
        <KpiCard
          title="High Risk Alerts"
          value="128"
          helperText="+15 new since last week."
          trendLabel="+15 new"
          trendType="negative"
          icon={<AlertTriangle size={18} />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FeatureImportance features={FEATURE_DATA} />
        <RiskBarChart data={RISK_BANDS} />
      </section>

      <section className="card-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              Top Predicted At-Risk Students
            </h2>
            <p className="mt-1 text-xs font-medium text-neutral-500">
              Students with risk scores above 75% requiring immediate attention.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
              Export CSV
            </button>
            <button className="rounded-full bg-black px-3 py-1.5 text-white">
              View All
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-100 bg-white text-xs font-semibold">
          <div className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr] bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
            <span>Student Name / ID</span>
            <span className="text-right">Risk Score</span>
            <span className="text-right">Primary Risk Driver</span>
            <span className="text-right">Last Activity</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {TOP_AT_RISK_STUDENTS.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-[2fr,1fr,2fr,1fr,1fr] items-center px-3 py-2"
              >
                <div>
                  <div className="text-sm font-bold">{student.name}</div>
                  <div className="text-[11px] text-neutral-600">
                    ID: {student.id}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    {student.riskScore}
                  </span>
                </div>
                <div className="text-right text-[11px] text-neutral-700">
                  {student.primaryDriver}
                </div>
                <div className="text-right text-[11px] text-neutral-600">
                  {student.lastActivity}
                </div>
                <div className="flex items-center justify-end gap-2 text-[11px]">
                  <button className="text-sky-600">Notify</button>
                  <button className="text-neutral-700">Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

