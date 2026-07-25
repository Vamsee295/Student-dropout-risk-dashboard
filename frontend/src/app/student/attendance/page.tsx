"use client";

import { useState } from "react";
import { CalendarCheck, AlertTriangle, TrendingUp, CheckCircle2, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const subjectAttendance = [
  { subject: "DBMS", code: "CS301", total: 28, present: 23, pct: 82, faculty: "Dr. Ramesh Kumar", color: "#3b82f6" },
  { subject: "OS", code: "CS302", total: 26, present: 21, pct: 81, faculty: "Prof. Ananya Sharma", color: "#6366f1" },
  { subject: "Machine Learning", code: "CS303", total: 25, present: 17, pct: 68, faculty: "Dr. Vikram Nair", color: "#ef4444", warning: true },
  { subject: "Networks", code: "CS304", total: 27, present: 20, pct: 74, faculty: "Prof. Deepa Pillai", color: "#f59e0b", borderline: true },
  { subject: "Math III", code: "MA301", total: 24, present: 19, pct: 79, faculty: "Dr. Srinivas Rao", color: "#10b981" },
];

const monthlyData = [
  { month: "Aug", pct: 88 }, { month: "Sep", pct: 84 },
  { month: "Oct", pct: 79 }, { month: "Nov", pct: 71 },
  { month: "Dec", pct: 77 }, { month: "Jan", pct: 82 },
];

// 75% calculator for ML
const mlTotal = 25;
const mlPresent = 17;
const mlTarget = 0.75;

function classesNeeded(present: number, total: number, target: number): number {
  let n = 0;
  while ((present + n) / (total + n) < target) n++;
  return n;
}

const mlNeeded = classesNeeded(mlPresent, mlTotal, mlTarget);

const calendarWeeks = [
  ["P", "P", "A", "P", "P"],
  ["P", "A", "P", "P", "A"],
  ["P", "P", "P", "A", "P"],
  ["A", "P", "P", "P", "P"],
  ["P", "P", "A", "P", "P"],
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function AttendancePage() {
  const [calc, setCalc] = useState({ present: mlPresent, total: mlTotal, target: 75 });
  const needed = classesNeeded(calc.present, calc.total, calc.target / 100);
  const currentPct = calc.total > 0 ? Math.round((calc.present / calc.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
        <p className="text-sm text-slate-400 mt-0.5">Semester 5 · January 2024</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: "78%", icon: <CalendarCheck size={20} />, color: "blue" },
          { label: "Classes Attended", value: "100/128", icon: <CheckCircle2 size={20} />, color: "emerald" },
          { label: "Below 75% Subjects", value: "1", icon: <AlertTriangle size={20} />, color: "red" },
          { label: "Borderline Subjects", value: "1", icon: <TrendingUp size={20} />, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              s.color === "red" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-900">Machine Learning Attendance — Critical ⚠</p>
          <p className="text-xs text-red-600 mt-0.5">
            Your current attendance is <strong>68%</strong> (17/25 classes). You need to attend the next <strong>{mlNeeded} consecutive classes</strong> to reach the required 75% threshold. Missing further classes may result in academic penalty.
          </p>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Subject-wise Attendance</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {subjectAttendance.map((s, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${s.warning ? "bg-red-50/50" : s.borderline ? "bg-amber-50/30" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-800">{s.subject}</p>
                  <span className="text-[10px] font-mono text-slate-400">{s.code}</span>
                  {s.warning && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Below 75%</span>}
                  {s.borderline && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Borderline</span>}
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{s.faculty}</p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{s.present}/{s.total} classes attended</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-2xl font-black ${s.warning ? "text-red-600" : s.borderline ? "text-amber-600" : "text-emerald-600"}`}>{s.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend + Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">Monthly Attendance Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Attendance"]} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={36}>
                  {monthlyData.map((d, i) => (
                    <Cell key={i} fill={d.pct < 75 ? "#ef4444" : d.pct < 80 ? "#f59e0b" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 75% Calculator */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calculator size={16} className="text-blue-600" /> Attendance Calculator
          </h3>
          <p className="text-xs text-slate-500 mb-4">Calculate how many classes you need to reach your target</p>
          <div className="space-y-3">
            {[
              { label: "Classes Attended", key: "present", max: 150 },
              { label: "Total Classes Held", key: "total", max: 200 },
              { label: "Target %", key: "target", max: 100 },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
                <input
                  type="number"
                  min={0} max={f.max}
                  value={calc[f.key as keyof typeof calc]}
                  onChange={(e) => setCalc((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl bg-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-slate-500 mb-1">Current: <strong className={currentPct < 75 ? "text-red-600" : "text-emerald-600"}>{currentPct}%</strong></p>
            {needed > 0 ? (
              <>
                <p className="text-2xl font-black text-blue-700">{needed}</p>
                <p className="text-[10px] text-blue-500 font-medium">consecutive classes needed</p>
              </>
            ) : (
              <p className="text-sm font-bold text-emerald-600">✅ Target Already Met!</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-5">ML Attendance Calendar (Jan 2024)</h3>
        <div className="grid grid-cols-6 gap-2 text-xs font-medium text-slate-400 mb-2">
          <span>Week</span>
          {days.map((d) => <span key={d} className="text-center">{d}</span>)}
        </div>
        {calendarWeeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-6 gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-400 self-center">W{wi + 1}</span>
            {week.map((day, di) => (
              <div key={di} className={`h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                day === "P" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
              }`}>{day}</div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" /> Absent</span>
        </div>
      </div>
    </div>
  );
}
