"use client";

import { useState } from "react";
import { BookOpen, Users, BarChart2, ChevronRight, Star, TrendingUp, Clock, FileText, Plus } from "lucide-react";
import Link from "next/link";

const courses = [
  { code: "CS301", name: "Database Management Systems", semester: 5, credits: 4, students: 62, attendance: 81, avgMarks: 72, completion: 78, color: "blue" },
  { code: "CS302", name: "Operating Systems", semester: 5, credits: 4, students: 58, attendance: 74, avgMarks: 68, completion: 65, color: "purple" },
  { code: "CS303", name: "Computer Networks", semester: 5, credits: 3, students: 30, attendance: 68, avgMarks: 64, completion: 55, color: "amber" },
  { code: "HS101", name: "Technical Communication", semester: 3, credits: 2, students: 90, attendance: 85, avgMarks: 80, completion: 91, color: "emerald" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
};
const borderMap: Record<string, string> = {
  blue: "border-l-blue-400",
  purple: "border-l-purple-400",
  amber: "border-l-amber-400",
  emerald: "border-l-emerald-400",
};

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your assigned courses, materials, and student progress</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: courses.length, icon: <BookOpen size={20} />, color: "text-blue-600 bg-blue-50" },
          { label: "Total Students", value: courses.reduce((a, c) => a + c.students, 0), icon: <Users size={20} />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Avg. Attendance", value: `${Math.round(courses.reduce((a, c) => a + c.attendance, 0) / courses.length)}%`, icon: <TrendingUp size={20} />, color: "text-amber-600 bg-amber-50" },
          { label: "Avg. Completion", value: `${Math.round(courses.reduce((a, c) => a + c.completion, 0) / courses.length)}%`, icon: <BarChart2 size={20} />, color: "text-purple-600 bg-purple-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {courses.map((course) => (
          <div key={course.code} className={`bg-white rounded-2xl border border-slate-100 border-l-4 shadow-sm p-6 hover:shadow-md transition-shadow ${borderMap[course.color]}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border mb-2 ${colorMap[course.color]}`}>{course.code}</div>
                <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Semester {course.semester} · {course.credits} Credits · {course.students} Students</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-semibold text-slate-600">{(course.avgMarks / 10).toFixed(1)}</span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Attendance</span>
                  <span className={`font-semibold ${course.attendance < 75 ? "text-red-600" : "text-emerald-600"}`}>{course.attendance}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${course.attendance < 75 ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${course.attendance}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Assignment Completion</span>
                  <span className="font-semibold text-slate-700">{course.completion}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${course.completion}%` }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <Link href="/faculty/attendance" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors">Attendance</Link>
              <Link href="/faculty/assessments" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors">Marks</Link>
              <Link href="/faculty/assignments" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors">Assignments</Link>
              <Link href="/faculty/analytics" className="flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors">
                <BarChart2 size={12} /> Analytics
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
