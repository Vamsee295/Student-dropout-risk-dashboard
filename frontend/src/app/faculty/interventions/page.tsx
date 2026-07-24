"use client";

import { useState } from "react";
import { HeartHandshake, Plus, CheckCircle2, Clock, AlertTriangle, MessageSquare, Users, Phone, BookOpen, UserCheck } from "lucide-react";

type InterventionType = "Counselling" | "Phone Call" | "Email" | "Meeting" | "Parent Meeting" | "Academic Support" | "Warning";

const interventions = [
  {
    id: 1, student: "Arjun Mehta", roll: "21CS001", type: "Meeting" as InterventionType,
    date: "2024-01-15", outcome: "Positive", status: "Completed",
    notes: "Student agreed to attend extra classes and reduce absences. Follow-up scheduled for Jan 22.",
    followUp: "2024-01-22",
  },
  {
    id: 2, student: "Priya Sharma", roll: "21CS047", type: "Counselling" as InterventionType,
    date: "2024-01-18", outcome: "In Progress", status: "Active",
    notes: "Student expressed stress about academic workload. Referred to student counselling center.",
    followUp: "2024-01-25",
  },
  {
    id: 3, student: "Rohit Kumar", roll: "21CS023", type: "Parent Meeting" as InterventionType,
    date: "2024-01-12", outcome: "Positive", status: "Completed",
    notes: "Parents were informed about low attendance. They agreed to support and monitor student schedule.",
    followUp: "2024-01-28",
  },
  {
    id: 4, student: "Kavya Reddy", roll: "21CS089", type: "Warning" as InterventionType,
    date: "2024-01-20", outcome: "Pending", status: "Active",
    notes: "Formal written warning issued. Student to maintain >75% attendance for next 3 weeks.",
    followUp: "2024-02-10",
  },
];

const iconForType = (type: InterventionType) => {
  const map: Record<InterventionType, React.ReactNode> = {
    "Counselling": <UserCheck size={16} />,
    "Phone Call": <Phone size={16} />,
    "Email": <MessageSquare size={16} />,
    "Meeting": <Users size={16} />,
    "Parent Meeting": <Users size={16} />,
    "Academic Support": <BookOpen size={16} />,
    "Warning": <AlertTriangle size={16} />,
  };
  return map[type];
};

const outcomeColor = (outcome: string) => {
  if (outcome === "Positive") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (outcome === "In Progress") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const typeBadge = (type: InterventionType) => {
  if (type === "Warning") return "bg-red-50 text-red-700 border-red-200";
  if (type === "Parent Meeting") return "bg-purple-50 text-purple-700 border-purple-200";
  if (type === "Counselling") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export default function InterventionsPage() {
  const [showForm, setShowForm] = useState(false);

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
          { label: "Total Interventions", value: 28, icon: <HeartHandshake size={18} />, color: "emerald" },
          { label: "Active / Ongoing", value: 8, icon: <Clock size={18} />, color: "blue" },
          { label: "Completed", value: 20, icon: <CheckCircle2 size={18} />, color: "green" },
          { label: "Positive Outcomes", value: "71%", icon: <AlertTriangle size={18} />, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "green" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Intervention Cards */}
      <div className="space-y-4">
        {interventions.map((item) => (
          <div key={item.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${item.status === "Active" ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-emerald-400"}`}>
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <div className={`p-2 rounded-xl border ${typeBadge(item.type)}`}>
                {iconForType(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{item.student}</h3>
                  <span className="text-xs font-mono text-slate-400">{item.roll}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge(item.type)}`}>{item.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${outcomeColor(item.outcome)}`}>{item.outcome}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Date: {item.date} · Follow-up: {item.followUp}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${item.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                {item.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm text-slate-600">
              <span className="text-xs font-semibold text-slate-400 uppercase mr-2">Notes:</span>
              {item.notes}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-100">
                Update Status
              </button>
              <button className="text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100">
                Add Follow-up
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-5">Log New Intervention</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Student</label>
                  <input type="text" placeholder="Student name or roll no." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Type</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
                    <option>Counselling</option><option>Phone Call</option><option>Meeting</option>
                    <option>Parent Meeting</option><option>Academic Support</option><option>Warning</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Notes</label>
                <textarea rows={4} placeholder="Describe the intervention, observations, and outcome..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Follow-up Date</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">Log Intervention</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
