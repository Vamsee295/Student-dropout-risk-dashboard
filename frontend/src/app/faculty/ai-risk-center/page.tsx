"use client";

import { Brain, AlertTriangle, TrendingUp, ShieldAlert, Activity, ArrowUpRight, Info } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import Link from "next/link";

const riskCategories = [
  { label: "Critical", count: 6, color: "#dc2626", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  { label: "High Risk", count: 16, color: "#f59e0b", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  { label: "Moderate", count: 51, color: "#6366f1", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
  { label: "Low Risk", count: 175, color: "#10b981", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
];

const predictedDropouts = [
  { name: "Arjun Mehta", roll: "21CS001", probability: 92, expectedDate: "Feb 2024", confidence: "High", reasons: ["51% Attendance", "3 Missed Exams", "No LMS Login 12 days"] },
  { name: "Priya Sharma", roll: "21CS047", probability: 88, expectedDate: "Mar 2024", confidence: "High", reasons: ["58% Attendance", "Declining Grades", "Low Engagement"] },
  { name: "Rohit Kumar", roll: "21CS023", probability: 84, expectedDate: "Mar 2024", confidence: "Medium", reasons: ["63% Attendance", "Failed CS303 Internal"] },
  { name: "Sanjay Patel", roll: "21CS012", probability: 81, expectedDate: "Apr 2024", confidence: "Medium", reasons: ["Financial Difficulty", "69% Attendance"] },
];

const featureImportance = [
  { feature: "Attendance Rate", importance: 85 },
  { feature: "Internal Marks", importance: 72 },
  { feature: "Assignment Completion", importance: 68 },
  { feature: "LMS Engagement", importance: 61 },
  { feature: "Login Frequency", importance: 55 },
  { feature: "Failure Ratio", importance: 49 },
];

const radarData = [
  { subject: "Attendance", A: 40, fullMark: 100 },
  { subject: "Marks", A: 55, fullMark: 100 },
  { subject: "Assignments", A: 35, fullMark: 100 },
  { subject: "Engagement", A: 30, fullMark: 100 },
  { subject: "Behavior", A: 60, fullMark: 100 },
];

const pieData = [
  { name: "Critical", value: 6, color: "#dc2626" },
  { name: "High Risk", value: 16, color: "#f59e0b" },
  { name: "Moderate", value: 51, color: "#6366f1" },
  { name: "Low Risk", value: 175, color: "#10b981" },
];

export default function AIRiskCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain size={24} className="text-purple-600" /> AI Risk Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Machine learning-powered dropout risk predictions and intervention recommendations</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Model Active · Last run: 2 hrs ago · Accuracy: 91.4%
        </div>
      </div>

      {/* Risk Category Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCategories.map((cat, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${cat.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${cat.text}`}>{cat.label}</span>
              <ArrowUpRight size={14} className={cat.text} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{cat.count}</p>
            <p className="text-xs text-slate-500 mt-1">students</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Pie */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Risk Distribution</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} students`, String(n)]} contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-bold text-slate-900">Feature Importance (SHAP Values)</h3>
            <span className="ml-auto text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">AI Explainability</span>
          </div>
          <div className="space-y-3">
            {featureImportance.map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium w-44 flex-shrink-0">{feat.feature}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-700"
                    style={{ width: `${feat.importance}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-purple-700 w-8 text-right">{feat.importance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar: Average At-Risk Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-2">Average At-Risk Profile</h3>
          <p className="text-xs text-slate-400 mb-4">Composite academic profile of high-risk students</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="At-Risk Average" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predicted Dropouts Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" /> Predicted Dropouts
            </h3>
            <Link href="/faculty/students/at-risk" className="text-xs text-emerald-600 font-medium hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {predictedDropouts.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-50 border border-red-100 hover:border-red-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{s.roll}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Expected: {s.expectedDate}</span>
                      <span className={`font-semibold ${s.confidence === "High" ? "text-red-600" : "text-amber-600"}`}>
                        {s.confidence} Confidence
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-600">{s.probability}%</span>
                    <p className="text-[10px] text-red-400 font-medium">dropout risk</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.reasons.map((r, j) => (
                    <span key={j} className="text-[10px] bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full font-medium">{r}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href="/faculty/interventions" className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Intervene Now
                  </Link>
                  <Link href={`/faculty/students/${s.roll.toLowerCase()}`} className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
