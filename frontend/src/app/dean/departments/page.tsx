"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Users, ChevronRight } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from "recharts";

const departments = [
  { code: "CSE", name: "Computer Science & Engineering", students: 480, faculty: 28, attendance: 84, cgpa: 8.1, dropout: 11, retention: 89, placement: 92, research: 87, budget: 72, risk: "low", hod: "Dr. Priya Sharma" },
  { code: "ECE", name: "Electronics & Communication", students: 360, faculty: 22, attendance: 78, cgpa: 7.6, dropout: 18, retention: 82, placement: 78, research: 71, budget: 65, risk: "moderate", hod: "Dr. Rakesh Gupta" },
  { code: "EEE", name: "Electrical & Electronics Eng", students: 240, faculty: 18, attendance: 80, cgpa: 7.4, dropout: 15, retention: 85, placement: 74, research: 62, budget: 58, risk: "moderate", hod: "Prof. Ananya Iyer" },
  { code: "Civil", name: "Civil Engineering", students: 200, faculty: 14, attendance: 71, cgpa: 6.8, dropout: 21, retention: 79, placement: 68, research: 54, budget: 61, risk: "high", hod: "Dr. Suresh Pillai" },
  { code: "Mech", name: "Mechanical Engineering", students: 320, faculty: 18, attendance: 67, cgpa: 6.9, dropout: 24, retention: 76, placement: 71, research: 58, budget: 69, risk: "critical", hod: "Dr. Deepak Nair" },
  { code: "MBA", name: "Master of Business Admin", students: 180, faculty: 14, attendance: 88, cgpa: 8.3, dropout: 9, retention: 91, placement: 88, research: 79, budget: 74, risk: "low", hod: "Dr. Meena Krishnan" },
  { code: "AI&DS", name: "Artificial Intelligence & Data Science", students: 240, faculty: 16, attendance: 91, cgpa: 8.6, dropout: 7, retention: 93, placement: 95, research: 92, budget: 80, risk: "low", hod: "Dr. Vikram Bose" },
];

const radarMetrics = departments.map((d) => ({
  dept: d.code,
  Attendance: d.attendance,
  Performance: Math.round(d.cgpa * 10),
  Retention: d.retention,
  Placement: d.placement,
}));

const riskColors = { low: "#10b981", moderate: "#f59e0b", high: "#ef4444", critical: "#dc2626" };
const riskBg = { low: "bg-emerald-100 text-emerald-700 border-emerald-200", moderate: "bg-amber-100 text-amber-700 border-amber-200", high: "bg-red-100 text-red-700 border-red-200", critical: "bg-red-200 text-red-800 border-red-300" };
const borderLeft = { low: "border-l-emerald-500", moderate: "border-l-amber-400", high: "border-l-red-500", critical: "border-l-red-700" };

export default function DepartmentsPage() {
  const [view, setView] = useState<"cards" | "compare">("cards");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Departments</h1>
          <p className="text-sm text-zinc-400 mt-0.5">7 Departments · 2,847 Students · 130 Faculty</p>
        </div>
        <div className="flex gap-2 bg-white border border-zinc-200 rounded-xl p-1">
          {(["cards", "compare"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${view === v ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-800"}`}>
              {v === "cards" ? "Department Cards" : "Comparison"}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-900">⚠ Immediate Action Required — Mechanical Engineering</p>
          <p className="text-xs text-red-700 mt-0.5">
            Mechanical Engineering has a <strong>24% dropout risk</strong> (↑8% since last semester). Primary causes: attendance 67% (below threshold), engagement score 48%.
            AI recommends: <strong>Deploy 2 additional mentors, conduct emergency academic workshop, and increase lab accessibility.</strong>
          </p>
        </div>
      </div>

      {view === "cards" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {departments.map((d, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-l-4 border-zinc-100 shadow-sm p-5 hover:shadow-md transition-all ${borderLeft[d.risk as keyof typeof borderLeft]}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-400">{d.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${riskBg[d.risk as keyof typeof riskBg]}`}>{d.risk} risk</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-0.5">{d.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">HOD: {d.hod}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: riskColors[d.risk as keyof typeof riskColors] }}>{d.dropout}%</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Dropout Risk</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Students", value: d.students },
                  { label: "Attendance", value: `${d.attendance}%` },
                  { label: "Avg CGPA", value: d.cgpa.toFixed(1) },
                  { label: "Placement", value: `${d.placement}%` },
                ].map((m, j) => (
                  <div key={j} className={`p-2.5 rounded-xl text-center ${m.label === "Attendance" && d.attendance < 75 ? "bg-red-50 border border-red-100" : "bg-zinc-50 border border-zinc-100"}`}>
                    <p className={`text-sm font-bold ${m.label === "Attendance" && d.attendance < 75 ? "text-red-600" : "text-zinc-800"}`}>{m.value}</p>
                    <p className="text-[9px] text-zinc-400 font-medium mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Metrics bars */}
              <div className="space-y-2">
                {[
                  { label: "Retention", value: d.retention },
                  { label: "Research Score", value: d.research },
                  { label: "Budget Usage", value: d.budget },
                ].map((m, j) => (
                  <div key={j}>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>{m.label}</span><span className="font-semibold text-zinc-600">{m.value}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.value >= 80 ? "#7c3aed" : m.value >= 65 ? "#6366f1" : "#f59e0b" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "compare" && (
        <div className="space-y-5">
          {/* Bar Comparison */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 mb-5">Department Comparison — Key Metrics</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="placement" name="Placement %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="dropout" name="Dropout %" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    {["Department", "Students", "Attendance", "CGPA", "Dropout", "Retention", "Placement", "Risk Level"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {departments.map((d, i) => (
                    <tr key={i} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-zinc-900">{d.code}</p>
                        <p className="text-[10px] text-zinc-400">{d.hod}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 font-semibold">{d.students}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold ${d.attendance < 75 ? "text-red-600" : "text-zinc-700"}`}>{d.attendance}%</span></td>
                      <td className="px-4 py-3 text-xs text-zinc-700 font-semibold">{d.cgpa}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold" style={{ color: riskColors[d.risk as keyof typeof riskColors] }}>{d.dropout}%</span></td>
                      <td className="px-4 py-3 text-xs text-zinc-700">{d.retention}%</td>
                      <td className="px-4 py-3 text-xs text-zinc-700">{d.placement}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${riskBg[d.risk as keyof typeof riskBg]}`}>{d.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
