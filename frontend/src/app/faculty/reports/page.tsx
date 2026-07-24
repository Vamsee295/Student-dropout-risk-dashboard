"use client";

import { FileBarChart, Download, FileText, Users, BarChart2, AlertTriangle, Calendar, Printer } from "lucide-react";
import Link from "next/link";

const reportTypes = [
  { title: "Attendance Report", desc: "Daily, weekly, or monthly attendance for all students or a specific course", icon: <Calendar size={24} />, color: "blue", href: "#" },
  { title: "Performance Report", desc: "Subject-wise and semester-wise marks analysis", icon: <BarChart2 size={24} />, color: "purple", href: "#" },
  { title: "Assignment Report", desc: "Submission rates, late submissions, and grading status", icon: <FileText size={24} />, color: "amber", href: "#" },
  { title: "Risk Report", desc: "AI-generated dropout risk report with factor breakdown", icon: <AlertTriangle size={24} />, color: "red", href: "#" },
  { title: "Student Profile Report", desc: "Complete academic and risk profile for individual students", icon: <Users size={24} />, color: "emerald", href: "#" },
  { title: "Department Report", desc: "Overall department performance summary for administration", icon: <FileBarChart size={24} />, color: "slate", href: "#" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-red-600 border-red-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

const recentReports = [
  { name: "Attendance Report – CS301 – Jan 2024", generated: "Jan 23, 2024", format: "PDF", size: "1.2 MB" },
  { name: "Risk Report – All Students – Jan 2024", generated: "Jan 22, 2024", format: "Excel", size: "3.4 MB" },
  { name: "Performance Report – Semester 5", generated: "Jan 20, 2024", format: "PDF", size: "2.1 MB" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Generate professional academic reports and export them</p>
        </div>
      </div>

      {/* Report Builder */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <FileBarChart size={18} className="text-emerald-600" /> Custom Report Builder
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Report Type</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
              <option>Attendance Report</option>
              <option>Performance Report</option>
              <option>Risk Report</option>
              <option>Assignment Report</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Course / Group</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
              <option>All Courses</option>
              <option>CS301 – DBMS</option>
              <option>CS302 – OS</option>
              <option>CS303 – Networks</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Date Range</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Semester</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <FileBarChart size={14} /> Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
            <Download size={14} /> Export as PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
            <Download size={14} /> Export as Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((rt, i) => (
          <button key={i} className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorMap[rt.color]}`}>
              {rt.icon}
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">{rt.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{rt.desc}</p>
            <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Generate <span>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Recently Generated Reports</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${r.format === "PDF" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.generated} · {r.size}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
