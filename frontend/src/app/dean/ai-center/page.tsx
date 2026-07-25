"use client";

import { useState } from "react";
import { BrainCircuit, Cpu, Target, Zap, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line } from "recharts";

const modelMetrics = [
  { label: "Prediction Accuracy", value: "92.4%", icon: <Target size={18} />, color: "emerald" },
  { label: "Precision", value: "89.1%", icon: <Cpu size={18} />, color: "blue" },
  { label: "Recall", value: "91.7%", icon: <Zap size={18} />, color: "violet" },
  { label: "F1 Score", value: "90.4%", icon: <CheckCircle2 size={18} />, color: "teal" },
];

const featureImportance = [
  { feature: "Attendance Rate", importance: 34, color: "#ef4444" },
  { feature: "LMS Engagement", importance: 22, color: "#f59e0b" },
  { feature: "Internal Marks", importance: 18, color: "#7c3aed" },
  { feature: "Assignment Completion", importance: 11, color: "#6366f1" },
  { feature: "Study Hours", importance: 8, color: "#3b82f6" },
  { feature: "Socioeconomic Factor", importance: 5, color: "#10b981" },
  { feature: "Prior Backlog", importance: 2, color: "#64748b" },
];

const deptRisk = [
  { dept: "CSE", risk: 11, confidence: 94 },
  { dept: "ECE", risk: 18, confidence: 88 },
  { dept: "EEE", risk: 15, confidence: 91 },
  { dept: "Civil", risk: 21, confidence: 86 },
  { dept: "Mech", risk: 24, confidence: 90 },
  { dept: "MBA", risk: 9, confidence: 95 },
  { dept: "AI&DS", risk: 7, confidence: 96 },
];

const recommendations = [
  { priority: 1, action: "Deploy emergency mentoring program — Mechanical Engineering", impact: "Estimated 6% dropout reduction", type: "critical" },
  { priority: 2, action: "Increase counselling sessions for Semester 1 students", impact: "19% sem-1 students are high risk — est. 4% reduction", type: "urgent" },
  { priority: 3, action: "Revise attendance policy — reduce threshold flexibility for repeat absentees", impact: "AI estimates 2.5% improvement in overall attendance", type: "important" },
  { priority: 4, action: "Expand financial aid to 50 additional borderline students", impact: "Reduces financial dropout by est. 3%", type: "important" },
  { priority: 5, action: "Launch bridge course for low-performing students in Maths and Physics", impact: "Improves CGPA by avg 0.4 points", type: "normal" },
  { priority: 6, action: "Introduce peer-learning clusters in ECE and Civil departments", impact: "Engagement score expected to rise 8-12%", type: "normal" },
];

const historicalAccuracy = [
  { month: "Aug", accuracy: 88 }, { month: "Sep", accuracy: 89 },
  { month: "Oct", accuracy: 90 }, { month: "Nov", accuracy: 91 },
  { month: "Dec", accuracy: 92 }, { month: "Jan", accuracy: 92.4 },
];

export default function AICenterPage() {
  const [tab, setTab] = useState<"model" | "insights" | "recommendations">("model");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">AI Intelligence Center</h1>
        <p className="text-sm text-zinc-400 mt-0.5">EduRisk AI v2.3 · Explainable AI · Executive Intelligence Platform</p>
      </div>

      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-2xl p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit size={18} className="text-violet-300" />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">EduRisk AI Model Status</span>
            </div>
            <p className="text-lg font-bold mb-1">Model: EduRisk Dropout Predictor v2.3</p>
            <p className="text-violet-200 text-xs">Last trained: January 15, 2024 · Dataset: 15,420 student records · 7 Semesters of historical data</p>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Model Status", value: "Active", good: true },
              { label: "Confidence", value: "High", good: true },
              { label: "Data Freshness", value: "Live", good: true },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/10 rounded-xl px-4 py-2.5 border border-white/20">
                <p className="text-sm font-bold text-emerald-300">{s.value}</p>
                <p className="text-[10px] text-violet-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white border border-zinc-200 rounded-xl p-1 w-fit">
        {[["model", "Model Dashboard"], ["insights", "Explainable AI"], ["recommendations", "AI Recommendations"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === k ? "bg-violet-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "model" && (
        <div className="space-y-5">
          {/* Model KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {modelMetrics.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  m.color === "emerald" ? "bg-emerald-50 text-emerald-600" : m.color === "blue" ? "bg-blue-50 text-blue-600" :
                  m.color === "violet" ? "bg-violet-50 text-violet-600" : "bg-teal-50 text-teal-600"
                }`}>{m.icon}</div>
                <p className="text-2xl font-black text-zinc-900">{m.value}</p>
                <p className="text-xs text-zinc-400 font-medium mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Historical Accuracy + Dept Risk */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-5">Model Accuracy Over Time</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalAccuracy} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <YAxis domain={[85, 95]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                    <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Accuracy"]} />
                    <Line type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: "#7c3aed" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-5">Department Risk Predictions</h3>
              <div className="space-y-3">
                {deptRisk.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500 w-10">{d.dept}</span>
                    <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.risk * 3}%`, backgroundColor: d.risk > 20 ? "#ef4444" : d.risk > 15 ? "#f59e0b" : "#7c3aed" }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 w-8">{d.risk}%</span>
                    <span className="text-[10px] text-zinc-400 w-14">CI: {d.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Feature Importance */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-5">Feature Importance (SHAP Analysis)</h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 110 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                    <YAxis type="category" dataKey="feature" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} width={110} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Impact"]} />
                    <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={18}>
                      {featureImportance.map((f, i) => <Cell key={i} fill={f.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Drivers */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-4">Risk Factor Explanation</h3>
              <div className="space-y-3">
                {featureImportance.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-zinc-800">{f.feature}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black" style={{ color: f.color }}>{f.importance}%</p>
                      <p className="text-[9px] text-zinc-400">of risk score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-violet-900 mb-2">🧠 AI Explanation — How Risk Scores are Calculated</p>
            <p className="text-xs text-violet-700 leading-relaxed">
              The EduRisk AI model uses a <strong>Gradient Boosted Tree ensemble</strong> with SHAP (SHapley Additive exPlanations) for interpretability.
              Attendance is the single strongest predictor at <strong>34%</strong> weight, followed by LMS engagement (22%) and internal marks (18%).
              Each student's risk score is calculated weekly from 7 features, and department-level scores are aggregated averages.
              Confidence intervals are derived from bootstrap sampling across 500 model iterations.
            </p>
          </div>
        </div>
      )}

      {tab === "recommendations" && (
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
            <BrainCircuit size={18} className="text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-violet-900">AI Policy Recommendations</p>
              <p className="text-xs text-violet-600 mt-0.5">Implementing all 6 recommendations is projected to reduce institutional dropout by <strong>8.5%</strong> by end of semester.</p>
            </div>
          </div>
          {recommendations.map((r, i) => (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${
              r.type === "critical" ? "border-l-4 border-l-red-600 border-zinc-100" :
              r.type === "urgent" ? "border-l-4 border-l-amber-400 border-zinc-100" : "border-zinc-100"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                  r.type === "critical" ? "bg-red-100 text-red-700" : r.type === "urgent" ? "bg-amber-100 text-amber-700" : "bg-violet-50 text-violet-600"
                }`}>{r.priority}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-zinc-900">{r.action}</p>
                    {(r.type === "critical" || r.type === "urgent") && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.type === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>{r.type}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-emerald-500" /> {r.impact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
