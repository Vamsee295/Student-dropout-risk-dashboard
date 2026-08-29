"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle, AlertCircle, Upload, Loader2 } from "lucide-react";
import apiClient from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

type FilterType = "all" | "pending" | "submitted" | "graded" | "overdue";

interface AssignmentEntry {
  id: number;
  assessment_id: number;
  assessment: {
    id: number;
    course_id: string;
    course_name: string;
    title: string;
    total_marks: number;
    due_date: string | null;
    type: string;
  };
  obtained_marks: number | null;
  status: string;
  submission_date: string | null;
  graded_at: string | null;
  rubric: {
    writing: number;
    understanding: number;
    learning: number;
    application: number;
    knowledge: number;
  } | null;
}

interface AssignmentsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_percentage: number;
  overdue_count: number;
  assignments: AssignmentEntry[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; border: string }> = {
  Pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertCircle size={14} />, border: "border-l-amber-500" },
  Submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} />, border: "border-l-blue-500" },
  Graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} />, border: "border-l-emerald-500" },
  Overdue: { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={14} />, border: "border-l-red-500" },
};

function formatDate(iso: string | null) {
  if (!iso) return "No deadline";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [data, setData] = useState<AssignmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res } = await apiClient.get("/assignments/student");
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (assignmentId: number, assessmentId: number) => {
    setSubmitting(assessmentId);
    try {
      await apiClient.post(`/assignments/${assessmentId}/submit`, {});
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Submit failed");
    } finally {
      setSubmitting(null);
    }
  };

  const assignments = data?.assignments ?? [];
  const filtered = filter === "all"
    ? assignments
    : assignments.filter((a) => a.status.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track and submit your course assignments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: data?.total ?? 0, icon: <ClipboardList size={18} />, color: "text-blue-600 bg-blue-50" },
          { label: "Completed", value: data?.completed ?? 0, icon: <CheckCircle2 size={18} />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending", value: data?.pending ?? 0, icon: <Clock size={18} />, color: "text-amber-600 bg-amber-50" },
          { label: "Overdue", value: data?.overdue ?? 0, icon: <XCircle size={18} />, color: "text-red-600 bg-red-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "…" : card.value}</p>
          </div>
        ))}
      </div>

      {/* Completion Progress */}
      {data && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700">Overall Completion</span>
            <span className="font-bold text-blue-600">{data.completion_percentage}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${data.completion_percentage}%` }} />
          </div>
          {data.overdue_count > 0 && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} /> {data.overdue_count} assignment{data.overdue_count > 1 ? "s" : ""} overdue!
            </p>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {(["all", "pending", "submitted", "graded", "overdue"] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
              filter === tab ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-blue-400" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Assignment Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <ClipboardList size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No assignments in this category</p>
            </div>
          ) : filtered.map((entry) => {
            const sc = statusConfig[entry.status] ?? statusConfig["Pending"];
            const title = entry.assessment.title;
            const course = entry.assessment.course_id;
            const maxMarks = entry.assessment.total_marks;
            const dueDate = formatDate(entry.assessment.due_date);
            const isPending = entry.status === "Pending" || entry.status === "Overdue";

            return (
              <div key={entry.id} className={`bg-white rounded-2xl border border-slate-100 border-l-4 shadow-sm p-5 hover:shadow-md transition-all ${sc.border}`}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{course}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Due: {dueDate} · Max Marks: {maxMarks}</p>
                  </div>
                  <div className="text-right">
                    {entry.obtained_marks !== null ? (
                      <div>
                        <p className="text-xl font-bold text-emerald-600">{entry.obtained_marks}</p>
                        <p className="text-[10px] text-slate-400">/ {maxMarks}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300">Not graded</p>
                    )}
                  </div>
                </div>

                {entry.submission_date && (
                  <p className="text-xs text-slate-400 mb-3">Submitted on: {formatDate(entry.submission_date)}</p>
                )}

                {entry.rubric && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rubric Evaluation</p>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                      {[
                        { label: "Writing", val: entry.rubric.writing },
                        { label: "Understanding", val: entry.rubric.understanding },
                        { label: "Learning", val: entry.rubric.learning },
                        { label: "Application", val: entry.rubric.application },
                        { label: "Knowledge", val: entry.rubric.knowledge },
                      ].map(r => (
                        <div key={r.label}>
                          <p className="text-[10px] text-slate-400">{r.label}</p>
                          <p className="text-sm font-semibold text-slate-700">{r.val} <span className="text-[10px] font-normal text-slate-400">/ 10</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isPending && (
                  <button
                    onClick={() => handleSubmit(entry.id, entry.assessment_id)}
                    disabled={submitting === entry.assessment_id}
                    className="flex items-center gap-2 text-xs px-4 py-2 mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {submitting === entry.assessment_id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Submit Assignment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
