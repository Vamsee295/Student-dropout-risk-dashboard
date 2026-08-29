"use client";

import { useState } from "react";
import {
  CalendarCheck, AlertTriangle, CheckCircle2, XCircle,
  TrendingDown, Search, Loader2, Users, Clock, Save, ArrowLeft
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAttendance } from "@/hooks/useAttendance";
import { BelowThresholdModal } from "@/components/faculty/BelowThresholdModal";

export default function AttendancePage() {
  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    
    sessions,
    isSessionsLoading,
    
    activeSessionId,
    roster,
    isRosterLoading,
    fetchRoster,
    toggleStudentRoster,
    
    postAttendance,
    isPosting,
    postSuccess,
    postError,

    stats,
    belowThresholdData,
    weeklyData,
  } = useAttendance();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter sessions by search (maybe by label or date)
  const filteredSessions = sessions.filter(s => 
    s.session_label.toLowerCase().includes(search.toLowerCase()) || 
    s.session_type.toLowerCase().includes(search.toLowerCase())
  );

  // Filter roster by search
  const filteredRoster = roster?.students.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase()) ||
    row.roll.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Session-based attendance marking</p>
        </div>
      </div>

      {/* Stats */}
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Top bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                {activeSessionId ? "Mark Attendance Roster" : "Select a Session"}
              </h2>
              <p className="text-xs text-slate-500">
                {activeSessionId 
                  ? `${roster?.session_type} • ${roster?.session_label} • ${new Date(roster?.session_date || "").toDateString()}`
                  : "Choose a course and a session to mark attendance"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!activeSessionId && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-indigo-400 font-medium text-slate-700"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.display}</option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeSessionId ? "Search students..." : "Search sessions..."}
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-400 w-48"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 bg-white">
          {!activeSessionId ? (
            /* SESSION LIST VIEW */
            isSessionsLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
                <p>Loading sessions...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <CalendarCheck size={48} className="mb-4 opacity-20" />
                <p>No sessions found for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSessions.map((sess) => (
                  <div 
                    key={sess.id}
                    onClick={() => fetchRoster(sess.id)}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                          {sess.section}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          sess.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {sess.session_label} <span className="font-normal text-slate-500 text-sm">({sess.session_type})</span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(sess.session_date).toDateString()}
                        {sess.start_time && ` • ${sess.start_time}`}
                      </p>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Users size={16} className="text-slate-400" />
                        {sess.total_students} Students
                      </div>
                      
                      {sess.status === "COMPLETED" ? (
                        <div className="flex gap-3 text-xs font-bold">
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{sess.present_count} P</span>
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">{sess.absent_count} A</span>
                        </div>
                      ) : (
                        <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
                          Mark Now &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ROSTER VIEW */
            isRosterLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
                <p>Loading roster...</p>
              </div>
            ) : (
              <div className="flex flex-col h-full max-h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={16} /> Back to Sessions
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded border border-slate-300 bg-white shadow-sm flex items-center justify-center text-transparent" /> 
                      <span className="text-slate-600 font-medium">Present (Default)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded border border-red-500 bg-red-50 flex items-center justify-center text-red-500">
                         <XCircle size={14} />
                      </span> 
                      <span className="text-slate-600 font-medium">Absent</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-slate-600 w-16 text-center">Status</th>
                        <th className="py-3 px-4 font-semibold text-slate-600">Roll No.</th>
                        <th className="py-3 px-4 font-semibold text-slate-600">Student Name</th>
                        <th className="py-3 px-4 font-semibold text-slate-600">Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map((student) => (
                        <tr 
                          key={student.student_id} 
                          className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${student.is_absent ? "bg-red-50/30" : ""}`}
                          onClick={() => toggleStudentRoster(student.student_id)}
                        >
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <div className={`w-5 h-5 rounded border shadow-sm flex items-center justify-center transition-colors ${
                                student.is_absent 
                                  ? "bg-red-100 border-red-500 text-red-600" 
                                  : "bg-white border-slate-300 text-transparent"
                              }`}>
                                {student.is_absent && <XCircle size={14} strokeWidth={3} />}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-500">{student.roll}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="py-3 px-4 text-slate-500">{student.section}</td>
                        </tr>
                      ))}
                      {filteredRoster.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-slate-400">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex gap-4">
                    <div className="text-sm">
                      <span className="text-slate-500">Present:</span>{" "}
                      <span className="font-bold text-emerald-600">
                        {roster?.students.filter(s => !s.is_absent).length}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Absent:</span>{" "}
                      <span className="font-bold text-red-600">
                        {roster?.students.filter(s => s.is_absent).length}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={postAttendance}
                    disabled={isPosting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isPosting ? "Saving..." : "Post Attendance"}
                  </button>
                </div>

                {/* Success / Error feedback — auto-clears, no redesign */}
                {postSuccess && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={16} className="shrink-0" />
                    {postSuccess}
                  </div>
                )}
                {postError && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
                    <XCircle size={16} className="shrink-0" />
                    {postError}
                  </div>
                )}
              </div>
            )
          )}
        </div>
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
