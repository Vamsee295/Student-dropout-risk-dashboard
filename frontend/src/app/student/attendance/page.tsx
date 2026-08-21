"use client";

import { useState } from "react";
import { CalendarCheck, AlertTriangle, TrendingUp, CheckCircle2, Calculator, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStudentAttendance, useStudentCalendar } from "@/hooks/useStudentAttendance";

function classesNeeded(present: number, total: number, target = 0.75): number {
  if (total === 0 || present / total >= target) return 0;
  let n = 0;
  while ((present + n) / (total + n) < target) n++;
  return n;
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function AttendancePage() {
  const { summary, loading, error } = useStudentAttendance();

  // Calendar: default to first subject with records
  const firstCourse = summary?.subjects?.[0]?.course_id ?? null;
  const [calendarCourseId, setCalendarCourseId] = useState<string | null>(null);
  const activeCourseId = calendarCourseId ?? firstCourse;
  const { calendar, loading: calLoading } = useStudentCalendar(activeCourseId);

  // Calculator state — seeded from worst subject
  const worstSubject = summary?.warnings?.[0];
  const [calc, setCalc] = useState({
    present: worstSubject?.present ?? 0,
    total: worstSubject?.total ?? 0,
    target: 75,
  });
  const calcNeeded = classesNeeded(calc.present, calc.total, calc.target / 100);
  const calcPct = calc.total > 0 ? Math.round((calc.present / calc.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-8 text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <p className="text-xs text-red-500 mt-1">Please make sure you are logged in as a student.</p>
      </div>
    );
  }

  const s = summary!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
        <p className="text-sm text-slate-400 mt-0.5">Live data from your attendance records</p>
      </div>

      {/* Overview Stats — all dynamic from DB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Attendance",
            value: `${s.overall_percentage.toFixed(1)}%`,
            icon: <CalendarCheck size={20} />,
            color: "blue",
          },
          {
            label: "Classes Attended",
            value: `${s.total_present}/${s.total_classes}`,
            icon: <CheckCircle2 size={20} />,
            color: "emerald",
          },
          {
            label: "Below 75% Subjects",
            value: s.below_75_count,
            icon: <AlertTriangle size={20} />,
            color: "red",
          },
          {
            label: "Borderline Subjects",
            value: s.borderline_count,
            icon: <TrendingUp size={20} />,
            color: "amber",
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              stat.color === "blue" ? "bg-blue-50 text-blue-600" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              stat.color === "red" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>{stat.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Warning Banners — dynamic, only shown when actually below 75% */}
      {s.warnings.map((w) => {
        const needed = classesNeeded(w.present, w.total);
        return (
          <div key={w.course_id} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">{w.course_name} Attendance — Critical ⚠</p>
              <p className="text-xs text-red-600 mt-0.5">
                Your current attendance is{" "}
                <strong>{w.percentage.toFixed(1)}%</strong>{" "}
                ({w.present}/{w.total} classes). You need to attend the next{" "}
                <strong>{needed} consecutive classes</strong> to reach the required 75% threshold.
                Missing further classes may result in academic penalty.
              </p>
            </div>
          </div>
        );
      })}

      {/* Subject-wise Attendance — all from DB */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Subject-wise Attendance</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {s.subjects.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              No attendance records yet.
            </div>
          )}
          {s.subjects.map((sub, i) => {
            const barColor = sub.is_below_75 ? "#ef4444" : sub.is_borderline ? "#f59e0b" : "#3b82f6";
            return (
              <div
                key={sub.course_id}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${
                  sub.is_below_75 ? "bg-red-50/50" : sub.is_borderline ? "bg-amber-50/30" : "hover:bg-slate-50/50"
                } ${activeCourseId === sub.course_id ? "ring-1 ring-blue-200" : ""}`}
                onClick={() => setCalendarCourseId(sub.course_id)}
                title="Click to view attendance calendar"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-800">{sub.course_name}</p>
                    <span className="text-[10px] font-mono text-slate-400">{sub.course_id}</span>
                    {sub.is_below_75 && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                        Below 75%
                      </span>
                    )}
                    {sub.is_borderline && !sub.is_below_75 && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                        Borderline
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{sub.faculty_name}</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, sub.percentage)}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{sub.present}/{sub.total} classes attended</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-2xl font-black ${
                    sub.is_below_75 ? "text-red-600" : sub.is_borderline ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {sub.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend + Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">Monthly Attendance Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.monthly_trend} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }}
                  formatter={(v: any) => [`${v}%`, "Attendance"]}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={36}>
                  {s.monthly_trend.map((d, i) => (
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
              { label: "Classes Attended", key: "present", max: 300 },
              { label: "Total Classes Held", key: "total", max: 400 },
              { label: "Target %", key: "target", max: 100 },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
                <input
                  type="number"
                  min={0}
                  max={f.max}
                  value={calc[f.key as keyof typeof calc]}
                  onChange={(e) => setCalc((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl bg-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-slate-500 mb-1">
              Current: <strong className={calcPct < 75 ? "text-red-600" : "text-emerald-600"}>{calcPct}%</strong>
            </p>
            {calcNeeded > 0 ? (
              <>
                <p className="text-2xl font-black text-blue-700">{calcNeeded}</p>
                <p className="text-[10px] text-blue-500 font-medium">consecutive classes needed</p>
              </>
            ) : (
              <p className="text-sm font-bold text-emerald-600">Target Already Met!</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Calendar — from real DB records */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">
            {calendar ? `${calendar.course_name} Attendance Calendar` : "Attendance Calendar"}
          </h3>
          {s.subjects.length > 0 && (
            <select
              value={activeCourseId ?? ""}
              onChange={(e) => setCalendarCourseId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 outline-none focus:border-blue-400"
            >
              {s.subjects.map((sub) => (
                <option key={sub.course_id} value={sub.course_id}>
                  {sub.course_name} ({sub.course_id})
                </option>
              ))}
            </select>
          )}
        </div>

        {calLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-blue-400" />
          </div>
        )}

        {!calLoading && calendar && (
          <>
            {/* Header row */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(5, 1fr)` }}>
              <span className="text-xs font-medium text-slate-400">Week</span>
              {DAY_ORDER.map((d) => (
                <span key={d} className="text-xs text-center font-medium text-blue-500">{d}</span>
              ))}
            </div>

            {calendar.weeks.map((week) => {
              // Build a full 5-column row, filling gaps
              const cellMap: Record<string, string> = {};
              for (const cell of week.cells) {
                cellMap[cell.day_label] = cell.status;
              }
              return (
                <div
                  key={week.week_label}
                  className="grid gap-2 mb-1.5"
                  style={{ gridTemplateColumns: `80px repeat(5, 1fr)` }}
                >
                  <span className="text-xs font-semibold text-slate-400 self-center">{week.week_label}</span>
                  {DAY_ORDER.map((day) => {
                    const status = cellMap[day];
                    if (!status) {
                      return (
                        <div key={day} className="h-9 rounded-lg bg-slate-50 border border-slate-100" />
                      );
                    }
                    return (
                      <div
                        key={day}
                        className={`h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                          status === "P" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {status}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {calendar.weeks.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                No attendance records for this course yet.
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" /> Absent</span>
            </div>
          </>
        )}

        {!calLoading && !calendar && (
          <div className="py-8 text-center text-sm text-slate-400">
            Select a subject to view the attendance calendar.
          </div>
        )}
      </div>
    </div>
  );
}
