"use client";

import { useState } from "react";
import { Folder, Plus, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Download, ChevronRight } from "lucide-react";

type FilterType = "all" | "active" | "closed" | "draft";

const assignments = [
  {
    id: 1, title: "Database Design Project", course: "CS301", dueDate: "2024-01-22", totalStudents: 62,
    submitted: 21, late: 4, missing: 37, status: "Active", maxMarks: 50, avgMarks: null,
    completion: 34,
  },
  {
    id: 2, title: "OS Shell Scripting Lab", course: "CS302", dueDate: "2024-01-20", totalStudents: 58,
    submitted: 52, late: 3, missing: 3, status: "Closed", maxMarks: 30, avgMarks: 24,
    completion: 95,
  },
  {
    id: 3, title: "Network Protocol Analysis", course: "CS303", dueDate: "2024-01-28", totalStudents: 30,
    submitted: 9, late: 0, missing: 21, status: "Active", maxMarks: 40, avgMarks: null,
    completion: 30,
  },
  {
    id: 4, title: "Technical Report Writing", course: "HS101", dueDate: "2024-02-05", totalStudents: 90,
    submitted: 0, late: 0, missing: 90, status: "Draft", maxMarks: 20, avgMarks: null,
    completion: 0,
  },
];

const statusBadge = (status: string) => {
  if (status === "Active") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Closed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = assignments.filter((a) => {
    if (filter === "all") return true;
    return a.status.toLowerCase() === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">Create, track, and grade student assignments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
          <Plus size={14} /> Create Assignment
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: assignments.length, icon: <Folder size={20} />, color: "blue" },
          { label: "Active", value: assignments.filter((a) => a.status === "Active").length, icon: <Clock size={20} />, color: "amber" },
          { label: "Awaiting Grading", value: assignments.filter((a) => a.status === "Closed" && !a.avgMarks).length + 55, icon: <FileText size={20} />, color: "purple" },
          { label: "Missing Submissions", value: assignments.reduce((s, a) => s + a.missing, 0), icon: <AlertCircle size={20} />, color: "red" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              card.color === "blue" ? "bg-blue-50 text-blue-600" :
              card.color === "amber" ? "bg-amber-50 text-amber-600" :
              card.color === "purple" ? "bg-purple-50 text-purple-600" : "bg-red-50 text-red-600"
            }`}>{card.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {(["all", "active", "closed", "draft"] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
              filter === tab ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {filtered.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(assignment.status)}`}>{assignment.status}</span>
                  <span className="text-xs text-slate-400 font-medium">{assignment.course}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{assignment.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Due: {assignment.dueDate} · Max Marks: {assignment.maxMarks}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium">
                  <Download size={12} /> Submissions
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold">
                  Grade <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Submission Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Submitted", value: assignment.submitted, icon: <CheckCircle2 size={14} />, color: "emerald" },
                { label: "Late", value: assignment.late, icon: <Clock size={14} />, color: "amber" },
                { label: "Missing", value: assignment.missing, icon: <XCircle size={14} />, color: "red" },
                { label: "Total", value: assignment.totalStudents, icon: <Folder size={14} />, color: "blue" },
              ].map((stat, i) => (
                <div key={i} className={`text-center p-3 rounded-xl ${
                  stat.color === "emerald" ? "bg-emerald-50" :
                  stat.color === "amber" ? "bg-amber-50" :
                  stat.color === "red" ? "bg-red-50" : "bg-blue-50"
                }`}>
                  <div className={`flex justify-center mb-1 ${
                    stat.color === "emerald" ? "text-emerald-600" :
                    stat.color === "amber" ? "text-amber-600" :
                    stat.color === "red" ? "text-red-600" : "text-blue-600"
                  }`}>{stat.icon}</div>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Completion Progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Completion Rate</span>
                <span className={`font-bold ${assignment.completion < 50 ? "text-red-600" : assignment.completion < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                  {assignment.completion}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    assignment.completion < 50 ? "bg-red-400" : assignment.completion < 75 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${assignment.completion}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
