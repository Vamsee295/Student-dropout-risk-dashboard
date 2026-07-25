"use client";

import { useState } from "react";
import { FileText, Download, Calendar, Mail, CheckCircle2 } from "lucide-react";

const reportTypes = [
  { id: "institution", label: "Institution Performance Report", desc: "Complete institutional overview — KPIs, trends, forecasts", formats: ["PDF", "Excel", "PowerPoint"], icon: "🏛" },
  { id: "department", label: "Department Analytics Report", desc: "Per-department breakdown — attendance, dropout, placement, CGPA", formats: ["PDF", "Excel"], icon: "🏢" },
  { id: "faculty", label: "Faculty Performance Report", desc: "Faculty rankings, feedback scores, research, evaluations", formats: ["PDF", "Excel"], icon: "👨‍🏫" },
  { id: "dropout", label: "Dropout Analysis Report", desc: "AI-powered dropout deep dive — SHAP factors, predictions", formats: ["PDF", "PowerPoint"], icon: "📉" },
  { id: "attendance", label: "Attendance Compliance Report", desc: "Department-wise, semester-wise attendance summary", formats: ["PDF", "Excel", "CSV"], icon: "📅" },
  { id: "placement", label: "Placement Analytics Report", desc: "Company-wise, department-wise, year-wise placement statistics", formats: ["PDF", "Excel", "PowerPoint"], icon: "💼" },
  { id: "financial", label: "Financial / Budget Report", desc: "Department budget allocation, utilization, variance analysis", formats: ["PDF", "Excel", "CSV"], icon: "💰" },
  { id: "naac", label: "NAAC Accreditation Report", desc: "Ready-to-submit evidence portfolio for NAAC audit", formats: ["PDF", "PowerPoint"], icon: "🏅" },
  { id: "research", label: "Research & Innovation Report", desc: "Faculty publications, patents, grants, research impact", formats: ["PDF", "Excel"], icon: "🔬" },
];

const scheduleOptions = ["Daily", "Weekly", "Monthly", "Semester", "Annual"];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("Monthly");
  const [scheduledReport, setScheduledReport] = useState("institution");
  const [scheduleSet, setScheduleSet] = useState(false);

  const generate = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      setGenerated((prev) => [...prev, id]);
      setTimeout(() => setGenerated((prev) => prev.filter((g) => g !== id)), 3000);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reports Center</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Executive reporting — generate, schedule, and export institutional reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Report Templates", value: "9", color: "violet" },
          { label: "Scheduled Reports", value: "3", color: "blue" },
          { label: "Generated This Month", value: "28", color: "emerald" },
          { label: "Last Generated", value: "Today", color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-center">
            <p className={`text-3xl font-black ${
              s.color === "violet" ? "text-violet-600" : s.color === "blue" ? "text-blue-600" :
              s.color === "emerald" ? "text-emerald-600" : "text-amber-600"
            }`}>{s.value}</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900">{r.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {r.formats.map((f, i) => (
                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-full">{f}</span>
              ))}
            </div>
            <button onClick={() => generate(r.id)} disabled={!!generating}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                generated.includes(r.id) ? "bg-emerald-600 text-white" :
                generating === r.id ? "bg-violet-100 text-violet-400 cursor-not-allowed" :
                "bg-violet-600 text-white hover:bg-violet-700"
              }`}>
              {generated.includes(r.id) ? <><CheckCircle2 size={14} /> Generated!</> :
               generating === r.id ? <><div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /> Generating...</> :
               <><Download size={13} /> Generate Report</>}
            </button>
          </div>
        ))}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={16} className="text-violet-600" />
          <h3 className="font-bold text-zinc-900">Schedule Automated Reports</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Report Type</label>
            <select value={scheduledReport} onChange={(e) => setScheduledReport(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
              {reportTypes.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Frequency</label>
            <select value={schedule} onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
              {scheduleOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Delivery</label>
            <select className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
              <option>Email to Dean</option>
              <option>Email to All HODs</option>
              <option>Dashboard Only</option>
            </select>
          </div>
        </div>
        <button onClick={() => { setScheduleSet(true); setTimeout(() => setScheduleSet(false), 2500); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            scheduleSet ? "bg-emerald-600 text-white" : "bg-violet-600 text-white hover:bg-violet-700"
          }`}>
          {scheduleSet ? <><CheckCircle2 size={15} /> Schedule Set!</> : <><Calendar size={14} /> Set Schedule</>}
        </button>
      </div>
    </div>
  );
}
