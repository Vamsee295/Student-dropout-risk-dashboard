"use client";

import { useState } from "react";
import { Star, TrendingUp, AlertTriangle, Users, Award, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const faculty = [
  { id: 1, name: "Dr. Priya Sharma", dept: "CSE", designation: "Professor", exp: 14, courses: 3, students: 82, attendance: 98, evaluation: 96, feedback: 4.8, research: 12, interventions: 8, rank: 1, status: "top" },
  { id: 2, name: "Dr. Vikram Bose", dept: "AI&DS", designation: "Associate Professor", exp: 9, courses: 3, students: 76, attendance: 95, evaluation: 92, feedback: 4.7, research: 9, interventions: 6, rank: 2, status: "top" },
  { id: 3, name: "Dr. Meena Krishnan", dept: "MBA", designation: "Professor", exp: 16, courses: 2, students: 62, attendance: 97, evaluation: 94, feedback: 4.6, research: 7, interventions: 11, rank: 3, status: "top" },
  { id: 4, name: "Prof. Ananya Iyer", dept: "EEE", designation: "Assistant Professor", exp: 6, courses: 3, students: 58, attendance: 88, evaluation: 84, feedback: 4.1, research: 3, interventions: 3, rank: 8, status: "normal" },
  { id: 5, name: "Dr. Rakesh Gupta", dept: "ECE", designation: "Associate Professor", exp: 11, courses: 4, students: 74, attendance: 91, evaluation: 88, feedback: 4.3, research: 6, interventions: 5, rank: 5, status: "normal" },
  { id: 6, name: "Dr. Suresh Pillai", dept: "Civil", designation: "Professor", exp: 18, courses: 2, students: 48, attendance: 82, evaluation: 78, feedback: 3.7, research: 4, interventions: 2, rank: 11, status: "support" },
  { id: 7, name: "Dr. Deepak Nair", dept: "Mech", designation: "Associate Professor", exp: 8, courses: 3, students: 64, attendance: 79, evaluation: 71, feedback: 3.4, research: 2, interventions: 1, rank: 14, status: "support" },
  { id: 8, name: "Prof. Ramesh Kumar", dept: "CSE", designation: "Assistant Professor", exp: 4, courses: 4, students: 96, attendance: 94, evaluation: 89, feedback: 4.4, research: 4, interventions: 7, rank: 4, status: "normal" },
];

const performanceData = faculty.slice(0, 6).map((f) => ({
  name: f.name.split(" ")[1],
  Feedback: Math.round(f.feedback * 20),
  Research: f.research * 5 > 100 ? 100 : f.research * 5,
  Interventions: f.interventions * 7 > 100 ? 100 : f.interventions * 7,
}));

const statusConfig = {
  top: { label: "Top Performer", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  normal: { label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" },
  support: { label: "Needs Support", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function FacultyPage() {
  const [filter, setFilter] = useState<"all" | "top" | "support">("all");
  const [sortBy, setSortBy] = useState("rank");

  const filtered = faculty.filter((f) => filter === "all" || f.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Faculty Management</h1>
        <p className="text-sm text-zinc-400 mt-0.5">142 Faculty · Performance & Engagement Analytics</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Faculty", value: "142", icon: <Users size={20} />, color: "violet" },
          { label: "Top Performers", value: "38", icon: <Award size={20} />, color: "emerald" },
          { label: "Need Support", value: "12", icon: <AlertTriangle size={20} />, color: "red" },
          { label: "Avg Feedback", value: "4.3/5", icon: <Star size={20} />, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "violet" ? "bg-violet-50 text-violet-600" : s.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              s.color === "red" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* AI Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">AI Faculty Performance Alert</p>
          <p className="text-xs text-amber-700 mt-0.5">
            <strong>Dr. Deepak Nair (Mech)</strong> and <strong>Dr. Suresh Pillai (Civil)</strong> show feedback scores below 3.7 and minimal intervention activity.
            Student outcomes in their departments are declining. Recommend: <strong>Mandatory professional development workshop + mentoring co-assignment with top performers.</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white border border-zinc-200 rounded-xl p-1 w-fit">
        {[["all", "All Faculty"], ["top", "Top Performers"], ["support", "Needs Support"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === k ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-800"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Faculty Cards */}
      <div className="space-y-3">
        {filtered.map((f, i) => {
          const sc = statusConfig[f.status as keyof typeof statusConfig];
          return (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 font-black text-lg flex items-center justify-center flex-shrink-0">
                  {f.name.split(" ").slice(1, 2)[0][0]}{f.name.split(" ").slice(2, 3)[0]?.[0] || ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-zinc-900">{f.name}</p>
                    <span className="text-[10px] text-zinc-400 font-mono">#{f.rank}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{f.designation} · {f.dept} · {f.exp} yrs experience</p>
                </div>
                <div className="grid grid-cols-5 gap-3 flex-shrink-0">
                  {[
                    { label: "Students", val: f.students },
                    { label: "Courses", val: f.courses },
                    { label: "Feedback", val: `${f.feedback}/5` },
                    { label: "Research", val: f.research },
                    { label: "Interventions", val: f.interventions },
                  ].map((m, j) => (
                    <div key={j} className="text-center">
                      <p className="text-sm font-bold text-zinc-900">{m.val}</p>
                      <p className="text-[9px] text-zinc-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Attendance Submission", val: f.attendance },
                  { label: "Evaluation Timeliness", val: f.evaluation },
                  { label: "Student Feedback Score", val: Math.round(f.feedback * 20) },
                ].map((m, j) => (
                  <div key={j}>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>{m.label}</span><span className="font-semibold">{m.val}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${m.val}%`,
                        backgroundColor: m.val >= 85 ? "#10b981" : m.val >= 70 ? "#7c3aed" : "#ef4444"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Faculty Performance Comparison</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
              <Bar dataKey="Feedback" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Research" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Interventions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
