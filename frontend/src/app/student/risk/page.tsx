"use client";

import { useState } from "react";
import { Brain, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, ArrowRight, Cpu, ShieldAlert, Calendar } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const riskHistory = [
  { month: "Aug", risk: 8 }, { month: "Sep", risk: 10 },
  { month: "Oct", risk: 18 }, { month: "Nov", risk: 22 },
  { month: "Dec", risk: 16 }, { month: "Jan", risk: 14 },
];

const riskFactors = [
  { factor: "Attendance", score: 68, benchmark: 75, impact: "High", status: "danger", contribution: 35 },
  { factor: "Assignment Completion", score: 86, benchmark: 80, impact: "Low", status: "safe", contribution: 10 },
  { factor: "LMS Engagement", score: 55, benchmark: 70, impact: "Medium", status: "warning", contribution: 25 },
  { factor: "Internal Marks", score: 71, benchmark: 75, impact: "Medium", status: "warning", contribution: 20 },
  { factor: "Study Hours", score: 26, benchmark: 35, impact: "Low", status: "warning", contribution: 10 },
];

const recommendations = [
  { priority: 1, action: "Attend the next 8 consecutive ML lectures", reason: "Your ML attendance is 68% — 7% below minimum. This is the #1 driver of your risk score.", type: "urgent" },
  { priority: 2, action: "Complete Assignment #4 by tonight", reason: "Late submission will increase your risk by an estimated 3-4 points.", type: "urgent" },
  { priority: 3, action: "Increase LMS daily login to 5 sessions/week", reason: "Current: 3 sessions/week. Low digital engagement correlates with 2x higher dropout probability.", type: "important" },
  { priority: 4, action: "Schedule 2 weekly Math III tutoring sessions", reason: "Math III average is 63% — below the class average of 71%.", type: "important" },
  { priority: 5, action: "Complete pending ML quizzes on LMS", reason: "You have 3 unfinished quiz modules which are factored into your engagement score.", type: "normal" },
];

const milestones = [
  { label: "Reduce dropout risk below 10%", target: 10, current: 14, done: false },
  { label: "Achieve 80% overall attendance", target: 80, current: 78, done: false },
  { label: "Maintain CGPA above 8.0", target: 8.0, current: 8.24, done: true },
  { label: "Submit all assignments on time", target: 100, current: 86, done: false },
];

const radarFactors = [
  { factor: "Attendance", value: 68 },
  { factor: "Engagement", value: 55 },
  { factor: "Marks", value: 71 },
  { factor: "Assignments", value: 86 },
  { factor: "Study Time", value: 60 },
];

export default function RiskPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "factors" | "plan">("overview");

  const risk = 14;
  const riskLabel = risk < 20 ? "Low Risk" : risk < 40 ? "Moderate Risk" : "High Risk";
  const riskColor = risk < 20 ? "#10b981" : risk < 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Success Coach</h1>
        <p className="text-sm text-slate-400 mt-0.5">Your personalized dropout risk analysis and action plan</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {[
          { key: "overview", label: "Risk Overview" },
          { key: "factors", label: "Risk Factors" },
          { key: "plan", label: "Action Plan" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Risk Score Hero */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-8">
              {/* Gauge */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-40 h-20 overflow-hidden">
                  <svg width="160" height="80" viewBox="0 0 160 80">
                    <path d="M 10 80 A 70 70 0 0 1 150 80" stroke="#f1f5f9" strokeWidth="14" fill="none" strokeLinecap="round" />
                    <path d="M 10 80 A 70 70 0 0 1 150 80" stroke={riskColor} strokeWidth="14" fill="none" strokeLinecap="round"
                      strokeDasharray={`${(risk / 100) * 220} 220`} />
                    <text x="80" y="70" textAnchor="middle" fontSize="22" fontWeight="900" fill={riskColor}>{risk}%</text>
                  </svg>
                </div>
                <span className="text-sm font-black mt-1" style={{ color: riskColor }}>{riskLabel}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Dropout Risk Score</p>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={18} className="text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">AI Risk Assessment</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Your current dropout risk is <strong style={{ color: riskColor }}>14% (Low)</strong>. 
                  This is calculated using your attendance, marks, engagement, and assignment completion. 
                  The primary driver is <strong>ML attendance at 68%</strong> — below the required 75% threshold. 
                  Take action now to prevent your risk from escalating.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">⚠ ML Attendance Critical</span>
                  <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">⚡ LMS Engagement Low</span>
                  <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">✅ Assignments Good</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Trend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Risk Score Trend (Semester 5)</h3>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><TrendingDown size={13} /> -8% since Oct</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Risk"]} />
                  <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2.5} fill="url(#riskGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Recovery Milestones</h3>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {m.done
                        ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-blue-300 flex-shrink-0" />}
                      <p className={`text-xs font-medium ${m.done ? "line-through text-slate-400" : "text-slate-700"}`}>{m.label}</p>
                    </div>
                    <span className={`text-xs font-bold ${m.done ? "text-emerald-600" : "text-blue-600"}`}>
                      {m.done ? "Achieved ✓" : `${m.current} / ${m.target}`}
                    </span>
                  </div>
                  {!m.done && (
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((m.current / m.target) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "factors" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Radar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3">Risk Factor Radar</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarFactors}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factor Contribution */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-5">Factor Contributions</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskFactors} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="factor" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Contribution"]} />
                    <Bar dataKey="contribution" radius={[0, 6, 6, 0]} barSize={22}>
                      {riskFactors.map((f, i) => (
                        <Cell key={i} fill={f.status === "danger" ? "#ef4444" : f.status === "warning" ? "#f59e0b" : "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Factor Cards */}
          <div className="space-y-3">
            {riskFactors.map((f, i) => (
              <div key={i} className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap items-center gap-4 ${
                f.status === "danger" ? "border-red-200" : f.status === "warning" ? "border-amber-200" : "border-slate-100"
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">{f.factor}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      f.status === "danger" ? "bg-red-100 text-red-700" :
                      f.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>{f.impact} Impact</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(f.score / 100) * 100}%`,
                      backgroundColor: f.status === "danger" ? "#ef4444" : f.status === "warning" ? "#f59e0b" : "#10b981"
                    }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Current: {f.score}</span>
                    <span>Benchmark: {f.benchmark}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black" style={{ color: f.status === "danger" ? "#ef4444" : f.status === "warning" ? "#f59e0b" : "#10b981" }}>{f.contribution}%</p>
                  <p className="text-[10px] text-slate-400">of risk</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "plan" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Cpu size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">AI-Personalized Action Plan</p>
              <p className="text-xs text-blue-600 mt-0.5">Following these recommendations can reduce your risk from 14% to under 8% within 3 weeks.</p>
            </div>
          </div>

          {recommendations.map((r, i) => (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${
              r.type === "urgent" ? "border-l-4 border-l-red-500 border-slate-100" :
              r.type === "important" ? "border-l-4 border-l-amber-400 border-slate-100" : "border-slate-100"
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                    r.type === "urgent" ? "bg-red-100 text-red-600" :
                    r.type === "important" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                  }`}>{r.priority}</div>
                  <p className="text-sm font-bold text-slate-900">{r.action}</p>
                </div>
                {r.type === "urgent" && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0 border border-red-200">URGENT</span>
                )}
              </div>
              <p className="text-xs text-slate-500 ml-10 leading-relaxed">{r.reason}</p>
            </div>
          ))}

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-bold text-emerald-900">Projected Outcome</h3>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">
              If you follow all 5 recommendations in the next 3 weeks, your dropout risk is predicted to fall to <strong>6-8%</strong>, 
              putting you in the <strong>Very Low Risk</strong> category. Your attendance will meet the 75% threshold and your 
              engagement score will improve by an estimated 25%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
