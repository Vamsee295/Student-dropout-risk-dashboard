"use client";

import { useState } from "react";
import { AlertTriangle, Search, Filter, ArrowUpRight, HeartHandshake, MessageSquare, UserPlus, FileText, Brain } from "lucide-react";
import Link from "next/link";

const atRiskStudents = [
  { name: "Arjun Mehta", roll: "21CS001", branch: "CSE", semester: 5, attendance: 51, marks: 38, engagement: 22, risk: 92, reasons: ["Attendance critical", "3 missed exams", "12-day LMS gap"], priority: "Critical" },
  { name: "Priya Sharma", roll: "21CS047", branch: "CSE", semester: 5, attendance: 58, marks: 42, engagement: 35, risk: 88, reasons: ["Declining grades", "Low LMS engagement", "Missed 2 assignments"], priority: "High" },
  { name: "Rohit Kumar", roll: "21CS023", branch: "CSE", semester: 5, attendance: 63, marks: 45, engagement: 40, risk: 84, reasons: ["Below 75% attendance", "Failed CS303 internal"], priority: "High" },
  { name: "Kavya Reddy", roll: "21CS089", branch: "CSE", semester: 5, attendance: 67, marks: 50, engagement: 45, risk: 82, reasons: ["Attendance warning", "Declining marks trend"], priority: "High" },
  { name: "Sanjay Patel", roll: "21CS012", branch: "CSE", semester: 5, attendance: 69, marks: 55, engagement: 48, risk: 81, reasons: ["Financial stress reported", "Attendance borderline"], priority: "High" },
  { name: "Deepika Nair", roll: "21CS067", branch: "CSE", semester: 5, attendance: 72, marks: 52, engagement: 50, risk: 79, reasons: ["Attendance near threshold", "Engagement declining"], priority: "Moderate" },
];

const priorityBadge = (p: string) => {
  if (p === "Critical") return "bg-red-100 text-red-700 border-red-200";
  if (p === "High") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-yellow-50 text-yellow-700 border-yellow-200";
};

const riskColor = (r: number) => {
  if (r >= 85) return "text-red-600";
  if (r >= 70) return "text-amber-600";
  return "text-yellow-600";
};

export default function AtRiskStudentsPage() {
  const [search, setSearch] = useState("");

  const filtered = atRiskStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={22} className="text-red-500" /> At-Risk Students
          </h1>
          <p className="text-sm text-slate-500 mt-1">Students predicted to be at risk of academic failure or dropout</p>
        </div>
        <div className="flex gap-2">
          <Link href="/faculty/ai-risk-center" className="flex items-center gap-2 px-4 py-2 text-sm border border-purple-200 bg-purple-50 text-purple-700 rounded-xl font-semibold hover:bg-purple-100 transition-colors">
            <Brain size={14} /> AI Risk Center
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Critical Risk", value: atRiskStudents.filter((s) => s.priority === "Critical").length, color: "red" },
          { label: "High Risk", value: atRiskStudents.filter((s) => s.priority === "High").length, color: "amber" },
          { label: "Moderate Risk", value: atRiskStudents.filter((s) => s.priority === "Moderate").length, color: "yellow" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${
            stat.color === "red" ? "bg-red-50 border-red-100" :
            stat.color === "amber" ? "bg-amber-50 border-amber-100" : "bg-yellow-50 border-yellow-100"
          }`}>
            <p className={`text-xs font-bold uppercase ${
              stat.color === "red" ? "text-red-600" : stat.color === "amber" ? "text-amber-600" : "text-yellow-600"
            }`}>{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">students</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-emerald-400"
        />
      </div>

      {/* Student Cards */}
      <div className="space-y-4">
        {filtered.map((student, i) => (
          <div key={i} className={`bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all ${
            student.priority === "Critical" ? "border-l-4 border-l-red-500 border-slate-100" :
            "border-l-4 border-l-amber-400 border-slate-100"
          }`}>
            <div className="flex flex-wrap items-start gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                  <span className="text-xs font-mono text-slate-400">{student.roll}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge(student.priority)}`}>
                    {student.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{student.branch} · Semester {student.semester}</p>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Attendance", value: `${student.attendance}%`, alert: student.attendance < 75 },
                    { label: "Avg. Marks", value: `${student.marks}/100`, alert: student.marks < 50 },
                    { label: "Engagement", value: `${student.engagement}%`, alert: student.engagement < 50 },
                  ].map((m, j) => (
                    <div key={j} className={`p-3 rounded-xl text-center ${m.alert ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"}`}>
                      <p className={`text-lg font-bold ${m.alert ? "text-red-600" : "text-slate-700"}`}>{m.value}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Reasons */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {student.reasons.map((r, j) => (
                    <span key={j} className="text-[10px] bg-red-50 border border-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{r}</span>
                  ))}
                </div>
              </div>

              {/* Risk Score */}
              <div className="text-center flex-shrink-0">
                <p className={`text-4xl font-black ${riskColor(student.risk)}`}>{student.risk}%</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">DROPOUT RISK</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
              <Link href={`/faculty/students/${student.roll.toLowerCase()}`} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                <ArrowUpRight size={12} /> View Profile
              </Link>
              <Link href="/faculty/interventions" className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                <HeartHandshake size={12} /> Log Intervention
              </Link>
              <Link href="/faculty/communication" className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                <MessageSquare size={12} /> Send Message
              </Link>
              <Link href="/faculty/schedule" className="flex items-center gap-1.5 text-xs px-3 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                <UserPlus size={12} /> Schedule Meeting
              </Link>
              <Link href="/faculty/reports" className="flex items-center gap-1.5 text-xs px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors">
                <FileText size={12} /> Generate Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
