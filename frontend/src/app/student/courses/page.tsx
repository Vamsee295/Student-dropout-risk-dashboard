"use client";

import { useState } from "react";
import { BookOpen, Users, Clock, TrendingUp, Star, ChevronRight, FileText, Video, MessageSquare } from "lucide-react";

const courses = [
  {
    code: "CS301", name: "Database Management Systems", faculty: "Dr. Ramesh Kumar",
    credits: 4, attendance: 82, avgMarks: 82, progress: 68, color: "blue",
    topics: "Normalization, SQL Joins, Transactions, Indexing",
    nextClass: "Mon 9:00 AM · LH-203",
    pending: 1,
  },
  {
    code: "CS302", name: "Operating Systems", faculty: "Prof. Ananya Sharma",
    credits: 4, attendance: 78, avgMarks: 76, progress: 72, color: "indigo",
    topics: "Process Scheduling, Memory Management, File Systems",
    nextClass: "Tue 11:00 AM · LH-105",
    pending: 0,
  },
  {
    code: "CS303", name: "Machine Learning", faculty: "Dr. Vikram Nair",
    credits: 3, attendance: 68, avgMarks: 71, progress: 55, color: "amber",
    topics: "Regression, Classification, Neural Networks",
    nextClass: "Mon 2:00 PM · LH-301",
    pending: 2,
    warning: "Attendance below 75%!",
  },
  {
    code: "CS304", name: "Computer Networks", faculty: "Prof. Deepa Pillai",
    credits: 3, attendance: 74, avgMarks: 68, progress: 62, color: "purple",
    topics: "TCP/IP, Routing Protocols, Network Security",
    nextClass: "Wed 9:00 AM · LH-204",
    pending: 1,
  },
  {
    code: "MA301", name: "Mathematics III", faculty: "Dr. Srinivas Rao",
    credits: 3, attendance: 80, avgMarks: 65, progress: 70, color: "rose",
    topics: "Complex Analysis, Fourier Transform, PDE",
    nextClass: "Thu 11:00 AM · LH-102",
    pending: 0,
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  amber: "bg-amber-500",
  purple: "bg-purple-600",
  rose: "bg-rose-500",
};

const borderMap: Record<string, string> = {
  blue: "border-l-blue-500",
  indigo: "border-l-indigo-500",
  amber: "border-l-amber-400",
  purple: "border-l-purple-500",
  rose: "border-l-rose-400",
};

export default function CoursesPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-400 mt-0.5">Semester 5 · 5 Enrolled Courses · 17 Credits</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Semester Progress</p>
          <p className="text-lg font-bold text-blue-600 mt-0.5">Week 8 / 16</p>
        </div>
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        {courses.map((course, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-l-4 border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${borderMap[course.color]}`}>
            <div className="p-5">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${colorMap[course.color]}`}>
                  {course.code.slice(0, 2)}<br />{course.code.slice(2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{course.code} · {course.credits} Credits · {course.faculty}</p>
                    </div>
                    {course.warning && (
                      <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold flex-shrink-0">⚠ {course.warning}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">📅 Next: {course.nextClass}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Attendance", value: `${course.attendance}%`, alert: course.attendance < 75 },
                  { label: "Avg Marks", value: `${course.avgMarks}/100`, alert: course.avgMarks < 70 },
                  { label: "Assignments", value: `${course.pending} pending`, alert: course.pending > 0 },
                ].map((m, j) => (
                  <div key={j} className={`p-3 rounded-xl text-center ${m.alert ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"}`}>
                    <p className={`text-sm font-bold ${m.alert ? "text-red-600" : "text-slate-700"}`}>{m.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Course Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Syllabus Progress</span>
                  <span className="font-semibold text-blue-600">{course.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colorMap[course.color]}`} style={{ width: `${course.progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Recent Topics: {course.topics}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Lecture Notes", icon: <FileText size={12} /> },
                  { label: "Recorded Classes", icon: <Video size={12} /> },
                  { label: "Discussion", icon: <MessageSquare size={12} /> },
                  { label: "Marks", icon: <Star size={12} /> },
                ].map((a, j) => (
                  <button key={j} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-medium transition-colors">
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
