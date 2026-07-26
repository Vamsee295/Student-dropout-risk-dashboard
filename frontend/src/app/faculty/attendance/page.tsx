"use client";

import { useState } from "react";
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Upload, Download, Users, TrendingDown, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useAttendance } from "@/hooks/useAttendance";

type StatusType = "P" | "A" | "L";

export default function AttendancePage() {
  const { weeklyData, belowThreshold, attendanceGrid, isLoading } = useAttendance();
  const [selectedCourse, setSelectedCourse] = useState("CS301");
  const [attendance, setAttendance] = useState<Record<string, Record<string, StatusType>>>({});

  const toggleStatus = (roll: string, day: string) => {
    setAttendance((prev) => {
      const current = prev[roll]?.[day] || "P";
      const next: StatusType = current === "P" ? "A" : current === "A" ? "L" : "P";
      return { ...prev, [roll]: { ...(prev[roll] || {}), [day]: next } };
    });
  };

  const getStatus = (roll: string, day: string, defaultVal: string): StatusType => {
    return (attendance[roll]?.[day] as StatusType) ?? (defaultVal as StatusType);
  };

  const statusStyle = (status: StatusType) => {
    if (status === "P") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "A") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  if (isLoading) return <div>Loading attendance data...</div>;

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present Today", value: "52", icon: <CheckCircle2 size={20} />, color: "emerald" },
          { label: "Absent Today", value: "10", icon: <XCircle size={20} />, color: "red" },
          { label: "Below 75%", value: belowThreshold.length, icon: <AlertTriangle size={20} />, color: "amber" },
          { label: "Overall Avg.", value: "76%", icon: <TrendingDown size={20} />, color: "blue" },
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
            <CalendarCheck size={18} className="text-emerald-600" /> Mark Today's Attendance
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-emerald-400"
            >
              <option value="CS301">CS301 – DBMS</option>
              <option value="CS302">CS302 – OS</option>
              <option value="CS303">CS303 – Networks</option>
              <option value="HS101">HS101 – Tech Comm</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search student..." className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-emerald-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> P = Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> A = Absent</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> L = Late</span>
          <span className="text-slate-400 ml-2">Click to toggle status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Roll No.</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <th key={d} className="text-center py-2 px-3 text-xs font-semibold text-slate-400 uppercase">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceGrid.map((student) => (
                <tr key={student.roll} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">{student.roll}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-800">{student.name}</td>
                  {(["mon", "tue", "wed", "thu", "fri"] as const).map((day, dayIdx) => {
                    const keys = ["mon", "tue", "wed", "thu", "fri"];
                    const defaultVal = student[day as keyof typeof student] as string;
                    const status = getStatus(student.roll, day, defaultVal);
                    return (
                      <td key={day} className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleStatus(student.roll, day)}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all hover:scale-110 ${statusStyle(status)}`}
                        >
                          {status}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Save Attendance
          </button>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Weekly Attendance Overview</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} name="Present" />
                <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} barSize={28} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Below Threshold */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-red-500" /> Below 75% Threshold
          </h3>
          <div className="space-y-3">
            {belowThreshold.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="text-xs font-bold text-red-900">{s.name}</p>
                  <p className="text-[10px] text-red-600">{s.course}</p>
                </div>
                <span className="text-sm font-bold text-red-700">{s.attendance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
