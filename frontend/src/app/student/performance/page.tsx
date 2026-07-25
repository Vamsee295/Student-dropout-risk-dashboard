"use client";

import { TrendingUp, Award, BookOpen, AlertTriangle, Star, Brain } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from "recharts";

const subjects = [
  { name: "DBMS", internal: 82, external: 85, lab: 88, total: 255, max: 300, grade: "A", credits: 4, pct: 85 },
  { name: "OS", internal: 76, external: 79, lab: 82, total: 237, max: 300, grade: "B+", credits: 4, pct: 79 },
  { name: "ML", internal: 71, external: 68, lab: 75, total: 214, max: 300, grade: "B", credits: 3, pct: 71 },
  { name: "Networks", internal: 68, external: 70, lab: 72, total: 210, max: 300, grade: "B", credits: 3, pct: 70 },
  { name: "Math III", internal: 65, external: 62, lab: 0, total: 127, max: 200, grade: "B-", credits: 3, pct: 63 },
];

const semesterGPA = [
  { sem: "S1", gpa: 7.8 }, { sem: "S2", gpa: 8.1 }, { sem: "S3", gpa: 7.9 },
  { sem: "S4", gpa: 8.4 }, { sem: "S5", gpa: 8.24 },
];

const radarData = [
  { subject: "Programming", A: 85 },
  { subject: "Maths", A: 63 },
  { subject: "Networks", A: 70 },
  { subject: "OS Concepts", A: 79 },
  { subject: "AI/ML", A: 71 },
  { subject: "Communication", A: 78 },
];

const gradeColors: Record<string, string> = {
  "A": "#10b981", "A+": "#10b981", "B+": "#3b82f6", "B": "#6366f1", "B-": "#f59e0b",
};

export default function PerformancePage() {
  const cgpa = 8.24;
  const semGPA = 8.24;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Performance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Semester 5 · January 2024</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Semester GPA", value: semGPA.toFixed(2), icon: <Star size={20} />, color: "blue" },
          { label: "CGPA", value: cgpa.toFixed(2), icon: <Award size={20} />, color: "purple" },
          { label: "Class Rank", value: "#12", icon: <TrendingUp size={20} />, color: "emerald" },
          { label: "Subjects Below Avg", value: "2", icon: <AlertTriangle size={20} />, color: "red" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "purple" ? "bg-purple-50 text-purple-600" :
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Subject-wise Marks Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Subject</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Internal</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">External</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Lab</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Total</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Grade</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.map((s, i) => (
                <tr key={i} className={`hover:bg-slate-50 transition-colors ${s.pct < 70 ? "bg-amber-50/30" : ""}`}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.credits} Credits</p>
                  </td>
                  <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.internal}</td>
                  <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.external}</td>
                  <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.lab > 0 ? s.lab : "—"}</td>
                  <td className="px-3 py-4 text-center">
                    <span className="text-sm font-bold text-slate-900">{s.total}</span>
                    <span className="text-xs text-slate-400">/{s.max}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="text-sm font-black" style={{ color: gradeColors[s.grade] || "#6366f1" }}>{s.grade}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full max-w-[120px]">
                      <div className="h-full rounded-full" style={{
                        width: `${s.pct}%`,
                        backgroundColor: s.pct < 70 ? "#f59e0b" : s.pct >= 80 ? "#10b981" : "#3b82f6"
                      }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{s.pct}%</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* GPA trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">Semester GPA Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterGPA} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[7, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}`, "GPA"]} />
                <Line type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-3">Skill Radar</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-blue-600" />
          <h3 className="font-bold text-blue-900">AI Performance Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: "strength", text: "You perform consistently well in programming-based subjects (DBMS, OS). Keep building on this strength.", icon: "💪" },
            { type: "warning", text: "Mathematics III scores have declined. Spend 4 additional study hours weekly on complex analysis.", icon: "⚠️" },
            { type: "tip", text: "Machine Learning theory scores lag behind lab scores. Focus on conceptual understanding and practice problems.", icon: "💡" },
          ].map((insight, i) => (
            <div key={i} className="bg-white rounded-xl border border-blue-100 p-4">
              <p className="text-xl mb-2">{insight.icon}</p>
              <p className="text-xs text-slate-700 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
