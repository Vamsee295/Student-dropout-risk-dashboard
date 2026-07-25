"use client";

import { Users, AlertTriangle, GraduationCap, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";

const semesterBreakdown = [
  { sem: "Sem 1", students: 580, risk: 19, attendance: 74 },
  { sem: "Sem 2", students: 510, risk: 16, attendance: 77 },
  { sem: "Sem 3", students: 474, risk: 14, attendance: 80 },
  { sem: "Sem 4", students: 448, risk: 13, attendance: 81 },
  { sem: "Sem 5", students: 410, risk: 12, attendance: 82 },
  { sem: "Sem 6", students: 380, risk: 10, attendance: 84 },
  { sem: "Sem 7", students: 290, risk: 9, attendance: 85 },
  { sem: "Sem 8", students: 255, risk: 7, attendance: 88 },
];

const genderDist = [
  { name: "Male", value: 62, fill: "#7c3aed" },
  { name: "Female", value: 37, fill: "#a78bfa" },
  { name: "Other", value: 1, fill: "#ddd6fe" },
];

const deptStudents = [
  { dept: "CSE", students: 480, risk: 53, low: 324, mod: 103, high: 53 },
  { dept: "ECE", students: 360, risk: 65, low: 233, mod: 62, high: 65 },
  { dept: "EEE", students: 240, risk: 36, low: 163, mod: 41, high: 36 },
  { dept: "Civil", students: 200, risk: 42, low: 124, mod: 34, high: 42 },
  { dept: "Mech", students: 320, risk: 77, low: 192, mod: 51, high: 77 },
  { dept: "MBA", students: 180, risk: 16, low: 140, mod: 24, high: 16 },
  { dept: "AI&DS", students: 240, risk: 17, low: 195, mod: 28, high: 17 },
];

const scholarshipDist = [
  { name: "Merit", value: 340, fill: "#10b981" },
  { name: "Sports", value: 120, fill: "#3b82f6" },
  { name: "SC/ST", value: 280, fill: "#f59e0b" },
  { name: "Financial Aid", value: 190, fill: "#8b5cf6" },
];

const attendanceHeatmap = [
  [84, 77, 81, 68, 91, 88],
  [79, 75, 78, 65, 87, 85],
  [82, 73, 76, 71, 90, 83],
  [86, 78, 82, 74, 93, 88],
];
const deptCodes = ["CSE", "ECE", "EEE", "Civil", "Mech", "MBA", "AI&DS"].slice(0, 6);
const semCodes = ["Sem1", "Sem2", "Sem3", "Sem4"];

export default function StudentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Student Analytics</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Institution-wide student performance intelligence</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "2,847", icon: <Users size={20} />, color: "violet", sub: "Active Enrollment" },
          { label: "High Risk Students", value: "306", icon: <AlertTriangle size={20} />, color: "red", sub: "Need intervention" },
          { label: "Scholarship Students", value: "930", icon: <GraduationCap size={20} />, color: "emerald", sub: "32.7% of total" },
          { label: "Dropout This Sem", value: "47", icon: <TrendingDown size={20} />, color: "amber", sub: "↓ 18 from last sem" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "violet" ? "bg-violet-50 text-violet-600" : s.color === "red" ? "bg-red-50 text-red-600" :
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{s.value}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Semester Dropout Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-5">Dropout Risk by Semester</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterBreakdown} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                <Bar dataKey="risk" name="Risk %" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={28}>
                  {semesterBreakdown.map((s, i) => (
                    <Cell key={i} fill={s.risk > 17 ? "#ef4444" : s.risk > 13 ? "#f59e0b" : "#7c3aed"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-3">Gender Distribution</h3>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderDist} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {genderDist.map((g, i) => <Cell key={i} fill={g.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {genderDist.map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.fill }} />
                  <span className="text-zinc-500 font-medium">{g.name}</span>
                </div>
                <span className="font-bold text-zinc-800">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept Risk Stacked */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Student Risk Distribution by Department</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptStudents} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="low" name="Low Risk" stackId="a" fill="#10b981" />
              <Bar dataKey="mod" name="Moderate" stackId="a" fill="#f59e0b" />
              <Bar dataKey="high" name="High Risk" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Attendance Heatmap — Dept × Semester</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 mb-2 min-w-[500px]">
            <div className="text-[10px] text-zinc-400 font-semibold text-center">Sem</div>
            {deptCodes.map((d) => <div key={d} className="text-[10px] text-zinc-400 font-semibold text-center">{d}</div>)}
          </div>
          {attendanceHeatmap.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-2 mb-1.5 min-w-[500px]">
              <div className="text-[10px] text-zinc-500 font-semibold self-center text-center">{semCodes[ri]}</div>
              {row.map((val, ci) => (
                <div key={ci} className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                  val >= 85 ? "bg-emerald-500 text-white" : val >= 78 ? "bg-violet-500 text-white" :
                  val >= 72 ? "bg-amber-400 text-white" : "bg-red-500 text-white"
                }`}>{val}%</div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-[10px]">
          {[["bg-emerald-500", "≥85% Excellent"], ["bg-violet-500", "78–84% Good"], ["bg-amber-400", "72–77% Low"], ["bg-red-500", "<72% Critical"]].map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${cls}`} />
              <span className="text-zinc-400">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scholarship Distribution */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-4">Scholarship Distribution (930 Students)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scholarshipDist.map((s, i) => (
            <div key={i} className="p-4 rounded-2xl border border-zinc-100 text-center bg-zinc-50">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.fill + "20" }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.fill }} />
              </div>
              <p className="text-xl font-black text-zinc-900">{s.value}</p>
              <p className="text-xs font-semibold text-zinc-500 mt-0.5">{s.name}</p>
              <p className="text-[10px] text-zinc-400">{Math.round((s.value / 930) * 100)}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
