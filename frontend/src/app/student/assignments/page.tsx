"use client";

import { useState } from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle, AlertCircle, Upload, ChevronRight, Download } from "lucide-react";

type FilterType = "all" | "upcoming" | "submitted" | "graded" | "late";

const assignments = [
  {
    id: 1, title: "DBMS Database Design Project", course: "CS301", due: "Jan 24, 2024",
    dueTime: "11:59 PM", status: "pending", marks: null, maxMarks: 50,
    submittedOn: null, feedback: null, urgent: true,
    description: "Design a normalized relational database for a university management system. Include ER diagram, schema, and sample queries.",
  },
  {
    id: 2, title: "OS Shell Scripting Assignment", course: "CS302", due: "Jan 20, 2024",
    dueTime: "11:59 PM", status: "submitted", marks: null, maxMarks: 30,
    submittedOn: "Jan 19, 2024", feedback: null, urgent: false,
    description: "Write shell scripts for process management, file operations, and system monitoring.",
  },
  {
    id: 3, title: "ML Feature Engineering Report", course: "CS303", due: "Jan 18, 2024",
    dueTime: "11:59 PM", status: "graded", marks: 38, maxMarks: 50,
    submittedOn: "Jan 18, 2024", feedback: "Good analysis of features. Improve your SHAP visualization and add more interpretation.", urgent: false,
    description: "Apply feature engineering techniques to the provided dataset and document your approach.",
  },
  {
    id: 4, title: "Networks Protocol Analysis", course: "CS304", due: "Jan 15, 2024",
    dueTime: "11:59 PM", status: "late", marks: 20, maxMarks: 40,
    submittedOn: "Jan 17, 2024", feedback: "Submitted 2 days late. Deducted 5 marks. Good analysis otherwise.", urgent: false,
    description: "Analyze TCP/IP protocol behavior using Wireshark captures.",
  },
  {
    id: 5, title: "Math III Problem Set 3", course: "MA301", due: "Jan 28, 2024",
    dueTime: "11:59 PM", status: "upcoming", marks: null, maxMarks: 20,
    submittedOn: null, feedback: null, urgent: false,
    description: "Solve complex analysis problems from Chapter 5-7.",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertCircle size={14} />, border: "border-l-amber-500" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} />, border: "border-l-blue-500" },
  graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} />, border: "border-l-emerald-500" },
  late: { label: "Late Submission", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={14} />, border: "border-l-red-500" },
  upcoming: { label: "Upcoming", color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Clock size={14} />, border: "border-l-slate-400" },
};

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [submitting, setSubmitting] = useState<number | null>(null);

  const filtered = filter === "all" ? assignments : assignments.filter((a) => a.status === filter);

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.status === "pending").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
    late: assignments.filter((a) => a.status === "late").length,
  };

  const avgScore = assignments
    .filter((a) => a.marks !== null)
    .reduce((acc, a) => acc + (a.marks! / a.maxMarks) * 100, 0) /
    assignments.filter((a) => a.marks !== null).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track all your assignments, submissions, and grades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "slate" },
          { label: "Pending", value: stats.pending, color: "amber" },
          { label: "Submitted", value: stats.submitted, color: "blue" },
          { label: "Graded", value: stats.graded, color: "emerald" },
          { label: "Avg Score", value: `${Math.round(avgScore)}%`, color: "purple" },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black ${
              s.color === "amber" ? "text-amber-600" : s.color === "blue" ? "text-blue-600" :
              s.color === "emerald" ? "text-emerald-600" : s.color === "purple" ? "text-purple-600" : "text-slate-800"
            }`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 w-fit flex-wrap">
        {(["all", "upcoming", "pending", "submitted", "graded", "late"] as FilterType[]).map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
              filter === tab ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}>
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {filtered.map((a) => {
          const conf = statusConfig[a.status as keyof typeof statusConfig];
          return (
            <div key={a.id} className={`bg-white rounded-2xl border border-l-4 border-slate-100 shadow-sm p-5 ${conf.border} ${a.urgent ? "ring-1 ring-red-200" : ""}`}>
              {a.urgent && (
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 w-fit">
                  <AlertCircle size={13} /> Due Tonight — Submit Now!
                </div>
              )}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{a.course} · Due: {a.due} {a.dueTime} · Max: {a.maxMarks} marks</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${conf.color}`}>
                  {conf.icon} {conf.label}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{a.description}</p>

              {/* Marks & Feedback */}
              {a.marks !== null && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-emerald-800">Score: {a.marks}/{a.maxMarks} ({Math.round((a.marks / a.maxMarks) * 100)}%)</p>
                  </div>
                  {a.feedback && <p className="text-xs text-emerald-700"><strong>Feedback:</strong> {a.feedback}</p>}
                </div>
              )}

              {/* Submitted info */}
              {a.submittedOn && (
                <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Submitted on {a.submittedOn}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {(a.status === "pending" || a.status === "upcoming") && (
                  <button
                    onClick={() => setSubmitting(submitting === a.id ? null : a.id)}
                    className="flex items-center gap-1.5 text-xs px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    <Upload size={12} /> Submit Assignment
                  </button>
                )}
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-100">
                  <Download size={12} /> Resources
                </button>
              </div>

              {/* Upload drawer */}
              {submitting === a.id && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-900 mb-3">Upload Submission</p>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-white">
                    <Upload size={24} className="text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-blue-600 font-medium">Drop files here or click to browse</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, ZIP — Max 50 MB</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setSubmitting(null)} className="flex-1 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button className="flex-1 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700">Submit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
