"use client";

import { FileText, Download, Upload, Search, FolderOpen, Shield, File, BookOpen } from "lucide-react";
import { useState } from "react";

const docs = [
  { name: "Semester 5 Hall Ticket", type: "Official", size: "1.2 MB", date: "Jan 15, 2024", icon: "🪪", category: "official" },
  { name: "Bonafide Certificate", type: "Official", size: "450 KB", date: "Jan 10, 2024", icon: "📋", category: "official" },
  { name: "Attendance Report – Jan 2024", type: "Attendance", size: "320 KB", date: "Jan 22, 2024", icon: "📅", category: "attendance" },
  { name: "Grade Card – Semester 4", type: "Marks", size: "580 KB", date: "Dec 20, 2023", icon: "📊", category: "grades" },
  { name: "AWS Cloud Practitioner Certificate", type: "Certification", size: "1.8 MB", date: "Dec 15, 2023", icon: "🏆", category: "certificates" },
  { name: "DBMS Assignment #3 Submission", type: "Assignment", size: "2.1 MB", date: "Jan 18, 2024", icon: "📝", category: "submissions" },
  { name: "ML Assignment #2 Feedback", type: "Feedback", size: "280 KB", date: "Jan 15, 2024", icon: "💬", category: "submissions" },
  { name: "Course Registration Form – Sem 5", type: "Official", size: "420 KB", date: "Aug 5, 2023", icon: "📄", category: "official" },
];

const categories = ["all", "official", "attendance", "grades", "certificates", "submissions"];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = docs
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => category === "all" || d.category === category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-400 mt-0.5">All your academic documents in one place</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: docs.length, icon: <FileText size={20} />, color: "blue" },
          { label: "Official Docs", value: docs.filter((d) => d.category === "official").length, icon: <Shield size={20} />, color: "purple" },
          { label: "Certificates", value: docs.filter((d) => d.category === "certificates").length, icon: <BookOpen size={20} />, color: "emerald" },
          { label: "Submissions", value: docs.filter((d) => d.category === "submissions").length, icon: <File size={20} />, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "purple" ? "bg-purple-50 text-purple-600" :
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Upload */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1 focus-within:border-blue-400 transition-colors min-w-[200px]">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..." className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
              category === cat ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}>{cat}</button>
        ))}
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((doc, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <span className="text-2xl flex-shrink-0">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.type} · {doc.size} · {doc.date}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-medium flex-shrink-0">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <FolderOpen size={36} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">No documents found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
