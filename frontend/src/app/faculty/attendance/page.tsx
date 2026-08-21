"use client";

import { useState } from "react";
import {
  CalendarCheck, AlertTriangle, CheckCircle2, XCircle,
  Upload, Download, TrendingDown, Search, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAttendance } from "@/hooks/useAttendance";
import { BelowThresholdModal } from "@/components/faculty/BelowThresholdModal";

// Only P and A — Late removed completely
type StatusType = "P" | "A" | "";

export default function AttendancePage() {
  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    weekOffset,
    setWeekOffset,
    grid,
    stats,
    isLoading,
    isToggling,
    toggleCell,
    weeklyData,
    belowThresholdData,
  } = useAttendance();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredGrid = grid.filter((row) =>
    row.student_name.toLowerCase().includes(search.toLowerCase()) ||
    row.roll.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (status: StatusType) => {
    if (status === "P") return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
    if (status === "A") return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    // No record yet — show as neutral, clicking will mark Present
    return "bg-slate-100 text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600";
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Get the Mon-Fri dates from first grid row (if any)
  const weekDates = grid[0]?.cells ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Mark and track student attendance across courses</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors">
            <Upload size={14} /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats — dynamically from MySQL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present Today", value: stats.present_today, icon: <CheckCircle2 size={20} />, color: "emerald" },
          { label: "Absent Today", value: stats.absent_today, icon: <XCircle size={20} />, color: "red" },
          { label: "Below 75%", value: stats.below_75_count, icon: <AlertTriangle size={20} />, color: "amber" },
          { label: "Overall Avg.", value: `${stats.overall_avg}%`, icon: <TrendingDown size={20} />, color: "blue" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              s.color === "red" ? "bg-red-50 text-red-600" :
              s.color === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Marking Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck size={18} className="text-emerald-600" /> Mark Today&apos;s Attendance
          </h3>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Course selector — from real DB */}
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-emerald-400"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.display}</option>
              ))}
            </select>

            {/* Week navigation */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-2 hover:bg-slate-50 text-slate-500 transition-colors"
                title="Previous week"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-slate-500 px-2">
                {weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)}w ago`}
              </span>
              <button
                onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
                disabled={weekOffset >= 0}
                className="p-2 hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-colors"
                title="Next week"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Legend — P and A ONLY, Late removed */}
        <div className="flex gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
            P = Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
            A = Absent
          </span>
          <span className="text-slate-400 ml-2">Click to toggle status</span>
          {isToggling && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Loader2 size={12} className="animate-spin" /> Saving...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Roll No.</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                  {weekDates.map((cell) => (
                    <th key={cell.date} className="text-center py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                      <div>{cell.day_label}</div>
                      <div className="text-[9px] font-normal text-slate-300 mt-0.5">
                        {new Date(cell.date + "T00:00:00").getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredGrid.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-400">
                      No students found for this course.
                    </td>
                  </tr>
                )}
                {filteredGrid.map((row) => (
                  <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{row.roll}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{row.student_name}</td>
                    {row.cells.map((cell) => {
                      const status = cell.status as StatusType;
                      return (
                        <td key={cell.date} className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleCell(row.student_id, cell.date)}
                            disabled={isToggling}
                            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all hover:scale-110 disabled:opacity-70 ${statusStyle(status)}`}
                            title={`${row.student_name} — ${cell.day_label} — ${status || "No record"}`}
                          >
                            {status || "–"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Trend + Below Threshold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Weekly Attendance Overview</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} name="Present" />
                <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} barSize={28} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(true); }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 cursor-pointer hover:border-amber-200 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-amber-500" /> Below 75% Threshold
            </h3>
            
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="text-5xl font-black text-slate-800 mb-2 group-hover:scale-110 transition-transform">
                {belowThresholdData.count}
              </div>
              <p className="text-sm font-medium text-slate-500 max-w-[150px]">
                Students below attendance threshold
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-amber-600 font-bold text-sm bg-amber-50 rounded-xl py-3 mt-4 group-hover:bg-amber-100 transition-colors">
            View all students &rarr;
          </div>
        </div>
      </div>

      <BelowThresholdModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={belowThresholdData.students}
        totalCount={belowThresholdData.count}
        courses={courses}
      />
    </div>
  );
}
