"use client";

import { useState, useEffect, useCallback } from "react";
import { HeartHandshake, Plus, CheckCircle2, Clock, AlertTriangle, MessageSquare, Users, Phone, BookOpen, UserCheck, Loader2 } from "lucide-react";
import apiClient from "@/api/axios";

type InterventionType = "Counselling" | "Phone Call" | "Email" | "Meeting" | "Parent Meeting" | "Academic Support" | "Warning";

interface InterventionItem {
  id: number;
  student_id: string;
  type: string;
  priority: string;
  status: string;
  due_date: string | null;
  notes?: string;
}

interface CreateForm {
  student_id: string;
  type: string;
  priority: string;
  notes: string;
  due_date: string;
}

const iconForType = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    "Counselling": <UserCheck size={16} />,
    "Phone Call": <Phone size={16} />,
    "Email": <MessageSquare size={16} />,
    "Meeting": <Users size={16} />,
    "Parent Meeting": <Users size={16} />,
    "Academic Support": <BookOpen size={16} />,
    "Warning": <AlertTriangle size={16} />,
  };
  return map[type] ?? <HeartHandshake size={16} />;
};

const statusColor = (status: string) => {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "In Progress") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Assigned") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const typeBadge = (type: string) => {
  if (type === "Warning") return "bg-red-50 text-red-700 border-red-200";
  if (type === "Parent Meeting") return "bg-purple-50 text-purple-700 border-purple-200";
  if (type === "Counselling") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const priorityColor = (priority: string) => {
  if (priority === "High") return "text-red-600";
  if (priority === "Medium") return "text-amber-600";
  return "text-slate-500";
};

export default function InterventionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<InterventionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateForm>({
    student_id: "",
    type: "Meeting",
    priority: "Medium",
    notes: "",
    due_date: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/interventions/");
      setItems(data.data ?? data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load interventions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.student_id || !form.type) return;
    setSubmitting(true);
    try {
      await apiClient.post("/interventions/", {
        student_id: form.student_id,
        type: form.type,
        priority: form.priority,
        notes: form.notes,
        due_date: form.due_date || null,
      });
      setShowForm(false);
      setForm({ student_id: "", type: "Meeting", priority: "Medium", notes: "", due_date: "" });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Failed to log intervention");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(id: number, status: string) {
    try {
      await apiClient.put(`/interventions/${id}/status`, { status });
      await load();
    } catch {
      alert("Failed to update status");
    }
  }

  const total = items.length;
  const active = items.filter((i) => i.status !== "Completed" && i.status !== "Cancelled").length;
  const completed = items.filter((i) => i.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake size={22} className="text-emerald-600" /> Interventions
          </h1>
          <p className="text-sm text-slate-500 mt-1">Log, track, and monitor all student support interventions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
          <Plus size={14} /> Log Intervention
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Interventions", value: loading ? "…" : total, icon: <HeartHandshake size={18} />, color: "emerald" },
          { label: "Active / Ongoing", value: loading ? "…" : active, icon: <Clock size={18} />, color: "blue" },
          { label: "Completed", value: loading ? "…" : completed, icon: <CheckCircle2 size={18} />, color: "green" },
          { label: "High Priority", value: loading ? "…" : items.filter((i) => i.priority === "High").length, icon: <AlertTriangle size={18} />, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "emerald" || s.color === "green" ? "bg-emerald-50 text-emerald-600" :
              s.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Intervention Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <HeartHandshake size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No interventions logged yet. Create one above.</p>
            </div>
          ) : items.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${item.status === "Completed" ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-blue-400"}`}>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <div className={`p-2 rounded-xl border ${typeBadge(item.type)}`}>
                  {iconForType(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{item.student_id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge(item.type)}`}>{item.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(item.status)}`}>{item.status}</span>
                    <span className={`text-[10px] font-bold ${priorityColor(item.priority)}`}>{item.priority} Priority</span>
                  </div>
                  {item.due_date && (
                    <p className="text-xs text-slate-400 mt-0.5">Due: {new Date(item.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {item.notes && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm text-slate-600 mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase mr-2">Notes:</span>
                  {item.notes}
                </div>
              )}

              <div className="flex gap-2">
                {item.status !== "Completed" && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, "In Progress")}
                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-100"
                  >
                    Mark In Progress
                  </button>
                )}
                {item.status !== "Completed" && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, "Completed")}
                    className="text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-5">Log New Intervention</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Student ID</label>
                  <input type="text" placeholder="e.g. STU1001"
                    value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
                    {["Counselling", "Phone Call", "Meeting", "Parent Meeting", "Academic Support", "Warning"].map((t) =>
                      <option key={t}>{t}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
                    {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Follow-up Date</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Notes</label>
                <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Describe the intervention, observations, and outcome..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={submitting || !form.student_id}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Log Intervention
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
