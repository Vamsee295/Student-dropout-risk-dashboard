"use client";

import { useState, useEffect } from "react";
import { Folder, Plus, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Download, ChevronRight, Loader2, X } from "lucide-react";
import apiClient from "@/api/axios";

interface AssignmentItem {
  id: number;
  title: string;
  course: string;
  course_name: string;
  dueDate: string;
  totalStudents: number;
  submitted: number;
  late: number;
  missing: number;
  status: string;
  maxMarks: number;
  avgMarks: number | null;
  completion: number;
}

interface CreateForm {
  course_id: string;
  title: string;
  total_marks: number;
  due_date: string;
}

const statusBadge = (status: string) => {
  if (status === "Active") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Closed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

type FilterType = "all" | "active" | "closed" | "draft";

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>({ course_id: "", title: "", total_marks: 50, due_date: "" });
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/assignments/faculty");
      setAssignments(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    apiClient.get("/faculty/my-courses").then(({ data }) => setCourses(data)).catch(() => {});
  }, []);

  const filtered = assignments.filter((a) => {
    if (filter === "all") return true;
    return a.status.toLowerCase() === filter;
  });

  async function handleCreate() {
    if (!form.course_id || !form.title) return;
    setCreating(true);
    try {
      await apiClient.post("/assignments", form);
      setShowCreate(false);
      setForm({ course_id: "", title: "", total_marks: 50, due_date: "" });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">Create, track, and grade student assignments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus size={14} /> Create Assignment
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">New Assignment</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
                >
                  <option value="">Select course…</option>
                  {courses.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Assignment title…"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={form.total_marks}
                    onChange={(e) => setForm({ ...form, total_marks: +e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !form.course_id || !form.title}
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1"
                >
                  {creating ? <Loader2 size={13} className="animate-spin" /> : null}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: assignments.length, icon: <Folder size={20} />, color: "blue" },
          { label: "Active", value: assignments.filter((a) => a.status === "Active").length, icon: <Clock size={20} />, color: "amber" },
          { label: "Awaiting Grading", value: assignments.filter((a) => a.status === "Closed" && !a.avgMarks).length, icon: <FileText size={20} />, color: "purple" },
          { label: "Missing Submissions", value: assignments.reduce((s, a) => s + a.missing, 0), icon: <AlertCircle size={20} />, color: "red" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              card.color === "blue" ? "bg-blue-50 text-blue-600" :
              card.color === "amber" ? "bg-amber-50 text-amber-600" :
              card.color === "purple" ? "bg-purple-50 text-purple-600" : "bg-red-50 text-red-600"
            }`}>{card.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "…" : card.value}</p>
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

      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Assignment Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <Folder size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No assignments found</p>
            </div>
          ) : filtered.map((assignment) => (
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
      )}
    </div>
  );
}
