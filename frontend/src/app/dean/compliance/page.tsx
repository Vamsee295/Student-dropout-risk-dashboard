"use client";

import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Download } from "lucide-react";

const standards = [
  {
    name: "NAAC",
    fullName: "National Assessment and Accreditation Council",
    grade: "A",
    score: 3.24,
    maxScore: 4.0,
    pct: 81,
    lastAudit: "March 2022",
    nextAudit: "March 2027",
    status: "accredited",
    criteria: [
      { name: "Curricular Aspects", score: 3.35, max: 4, status: "pass" },
      { name: "Teaching-Learning & Evaluation", score: 3.42, max: 4, status: "pass" },
      { name: "Research & Innovation", score: 3.10, max: 4, status: "pass" },
      { name: "Infrastructure & Learning Resources", score: 3.28, max: 4, status: "pass" },
      { name: "Student Support & Progression", score: 3.15, max: 4, status: "pass" },
      { name: "Governance, Leadership & Management", score: 3.40, max: 4, status: "pass" },
      { name: "Institutional Values & Best Practices", score: 3.08, max: 4, status: "pass" },
    ],
  },
];

const accreditationItems = [
  { standard: "NAAC A Grade", status: "pass", detail: "Score: 3.24/4.0 · Valid until 2027" },
  { standard: "NBA Accreditation (CSE)", status: "pass", detail: "Accredited until Dec 2025" },
  { standard: "NBA Accreditation (ECE)", status: "pass", detail: "Accredited until Oct 2024" },
  { standard: "NBA Accreditation (Mech)", status: "fail", detail: "Application pending · Audit scheduled Feb 2024" },
  { standard: "AICTE Approval 2023–24", status: "pass", detail: "All 7 programs approved" },
  { standard: "UGC Recognized University", status: "pass", detail: "Permanent affiliation · Status A" },
  { standard: "ISO 21001:2018", status: "warning", detail: "Renewal due March 2024 · Documents in progress" },
];

const kqis = [
  { metric: "Student-Faculty Ratio", value: "20:1", target: "≤20:1", status: "pass" },
  { metric: "PhD Faculty (%)", value: "62%", target: "≥60%", status: "pass" },
  { metric: "Research Papers (2023)", value: "412", target: "≥350", status: "pass" },
  { metric: "Graduation Rate", value: "91%", target: "≥85%", status: "pass" },
  { metric: "Placement Rate", value: "84%", target: "≥80%", status: "pass" },
  { metric: "Avg Attendance", value: "79.6%", target: "≥75%", status: "pass" },
  { metric: "Library Volumes", value: "48,200", target: "≥40,000", status: "pass" },
  { metric: "ICT Infrastructure", value: "88%", target: "≥85%", status: "pass" },
  { metric: "Students with Scholarship", value: "32.7%", target: "≥30%", status: "pass" },
  { metric: "NBA Accredited Programs", value: "4/7", target: "≥5/7", status: "warning" },
];

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Accreditation & Compliance</h1>
          <p className="text-sm text-zinc-400 mt-0.5">NAAC · NBA · AICTE · UGC · ISO 21001 regulatory readiness</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
          <Download size={14} /> Export Accreditation Report
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Standards Met", value: "5/7", color: "emerald" },
          { label: "NAAC Grade", value: "A", color: "violet" },
          { label: "NBA Accredited", value: "4/7", color: "amber" },
          { label: "Next Audit", value: "14d", color: "red" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-center">
            <p className={`text-3xl font-black ${
              s.color === "emerald" ? "text-emerald-600" : s.color === "violet" ? "text-violet-600" :
              s.color === "amber" ? "text-amber-600" : "text-red-600"
            }`}>{s.value}</p>
            <p className="text-xs text-zinc-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Standards Status */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-2">
          <ShieldCheck size={16} className="text-violet-600" />
          <h3 className="font-bold text-zinc-900">Accreditation Standards Status</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {accreditationItems.map((a, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors">
              {a.status === "pass" ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> :
               a.status === "warning" ? <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" /> :
               <XCircle size={18} className="text-red-500 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-800">{a.standard}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{a.detail}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                a.status === "pass" ? "bg-emerald-100 text-emerald-700" :
                a.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}>{a.status === "pass" ? "Compliant" : a.status === "warning" ? "Action Needed" : "Pending"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NAAC Criteria */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900">NAAC Criteria Breakdown (Score: 3.24/4.0 · Grade A)</h3>
        </div>
        <div className="space-y-3">
          {standards[0].criteria.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-700">{c.name}</span>
                <span className="font-bold text-violet-600">{c.score}/{c.max}</span>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${(c.score / c.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Quality Indicators */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900">Key Quality Indicators (KQI) Compliance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Metric", "Current Value", "Target", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {kqis.map((k, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 text-xs font-semibold text-zinc-800">{k.metric}</td>
                  <td className="px-5 py-3 text-xs font-bold text-zinc-900">{k.value}</td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{k.target}</td>
                  <td className="px-5 py-3">
                    {k.status === "pass" ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                     <AlertTriangle size={16} className="text-amber-500" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
