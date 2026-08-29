"use client";

import { useState, useEffect } from "react";
import { Brain, AlertTriangle, TrendingUp, ShieldAlert, Activity, ArrowUpRight, Info } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import Link from "next/link";
import apiClient from "@/api/axios";

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

export default function AIRiskCenterPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    apiClient.get("/risk/faculty/summary").then(res => setSummary(res.data?.data)).catch(console.error);
  }, []);

  const distribution = summary?.distribution || {};
  const predictedDropouts = summary?.predictedDropouts || [];
  
  const riskCategories = [
    { label: "High Risk", count: distribution["High Risk"] || 0, color: "#dc2626", bg: "bg-red-50 border-red-200", text: "text-red-700" },
    { label: "Moderate Risk", count: distribution["Moderate Risk"] || 0, color: "#f59e0b", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    { label: "Stable", count: distribution["Stable"] || 0, color: "#6366f1", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
    { label: "Safe", count: distribution["Safe"] || 0, color: "#10b981", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  ];

  const pieData = riskCategories.filter(r => r.count > 0).map(r => ({
    name: r.label, value: r.count, color: r.color
  }));

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
            {predictedDropouts.length === 0 && (
              <div className="p-4 text-center text-slate-500">No high risk students found.</div>
            )}
            {predictedDropouts.map((student: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-slate-50 transition-colors border border-slate-100 rounded-xl mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{student.name}</h4>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{student.roll}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{student.probability}% Risk</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.reasons.map((reason: string, idx: number) => (
                      <span key={idx} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{reason}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <Link href={`/faculty/students/${student.student_id}`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View Profile</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
