"use client";

import { useState } from "react";
import { ClipboardList, Plus, Upload, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const exams = [
  { id: 1, title: "DBMS Mid-Term Exam", course: "CS301", type: "Internal", date: "2024-01-15", totalMarks: 50, avgMarks: 36, highestMarks: 49, lowestMarks: 12, passRate: 84, status: "Published" },
  { id: 2, title: "OS Lab Practical", course: "CS302", type: "Lab", date: "2024-01-18", totalMarks: 30, avgMarks: 22, highestMarks: 30, lowestMarks: 8, passRate: 91, status: "Published" },
  { id: 3, title: "Networks Internal 1", course: "CS303", type: "Internal", date: "2024-01-20", totalMarks: 50, avgMarks: 31, highestMarks: 47, lowestMarks: 9, passRate: 72, status: "Pending Evaluation" },
  { id: 4, title: "Tech Comm Presentation", course: "HS101", type: "Practical", date: "2024-01-22", totalMarks: 20, avgMarks: 16, highestMarks: 20, lowestMarks: 10, passRate: 98, status: "Published" },
];

const distributionData = [
  { range: "0-10", count: 3 },
  { range: "11-20", count: 5 },
  { range: "21-30", count: 14 },
  { range: "31-40", count: 22 },
  { range: "41-50", count: 18 },
];

const weakTopics = [
  { topic: "SQL Joins and Subqueries", difficulty: 78, students: 28 },
  { topic: "Normalization Forms", difficulty: 71, students: 24 },
  { topic: "Transaction Management", difficulty: 65, students: 19 },
  { topic: "B-Tree Indexing", difficulty: 60, students: 16 },
];

export default function AssessmentsPage() {
  const [activeExam, setActiveExam] = useState(exams[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage exams, upload marks, and analyze performance</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-medium text-slate-700">
            <Upload size={14} /> Upload Marks
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
            <Plus size={14} /> Create Exam
          </button>
        </div>
      </div>

      {/* Exam List + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Exam Records</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setActiveExam(exam)}
                className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors ${activeExam.id === exam.id ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""}`}
              >
                <p className={`text-sm font-semibold ${activeExam.id === exam.id ? "text-emerald-700" : "text-slate-800"}`}>{exam.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{exam.course} · {exam.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    exam.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>{exam.status}</span>
                  <span className="text-[10px] text-slate-400">{exam.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900">{activeExam.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeExam.course} · {activeExam.type} · {activeExam.date}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                activeExam.status === "Published" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}>{activeExam.status}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Average", value: `${activeExam.avgMarks}/${activeExam.totalMarks}`, icon: <TrendingUp size={16} />, color: "blue" },
                { label: "Highest", value: `${activeExam.highestMarks}/${activeExam.totalMarks}`, icon: <CheckCircle2 size={16} />, color: "emerald" },
                { label: "Lowest", value: `${activeExam.lowestMarks}/${activeExam.totalMarks}`, icon: <AlertTriangle size={16} />, color: "red" },
                { label: "Pass Rate", value: `${activeExam.passRate}%`, icon: <ClipboardList size={16} />, color: "purple" },
              ].map((s, i) => (
                <div key={i} className={`p-4 rounded-xl border text-center ${
                  s.color === "blue" ? "bg-blue-50 border-blue-100" :
                  s.color === "emerald" ? "bg-emerald-50 border-emerald-100" :
                  s.color === "red" ? "bg-red-50 border-red-100" : "bg-purple-50 border-purple-100"
                }`}>
                  <div className={`flex justify-center mb-1 ${
                    s.color === "blue" ? "text-blue-600" :
                    s.color === "emerald" ? "text-emerald-600" :
                    s.color === "red" ? "text-red-600" : "text-purple-600"
                  }`}>{s.icon}</div>
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5">Score Distribution</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Weak Topics Analysis */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-100 rounded-xl text-purple-700"><AlertTriangle size={18} /></div>
          <div>
            <h3 className="font-bold text-slate-900">AI Weak Topic Analysis</h3>
            <p className="text-xs text-slate-400">Topics where students scored the least — prioritize for revision</p>
          </div>
        </div>
        <div className="space-y-4">
          {weakTopics.map((topic, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{topic.topic}</span>
                  <span className="text-xs text-slate-400">{topic.students} students struggled</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${topic.difficulty}%` }} />
                </div>
              </div>
              <span className="text-sm font-bold text-red-600 w-12 text-right">{topic.difficulty}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
