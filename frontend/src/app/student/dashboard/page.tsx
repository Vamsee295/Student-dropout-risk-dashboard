"use client";

import { useState } from "react";
import {
  GraduationCap, TrendingUp, CalendarCheck, AlertTriangle,
  BookOpen, Clock, ArrowRight, Flame, CheckCircle2,
  Circle, ChevronRight, Cpu, Target, Zap, Bell
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line
} from "recharts";

const attendanceTrend = [
  { week: "W1", value: 71 }, { week: "W2", value: 74 },
  { week: "W3", value: 70 }, { week: "W4", value: 75 },
  { week: "W5", value: 78 }, { week: "W6", value: 76 },
  { week: "W7", value: 80 }, { week: "W8", value: 82 },
];

const marksTrend = [
  { month: "Aug", marks: 72 }, { month: "Sep", marks: 75 },
  { month: "Oct", marks: 68 }, { month: "Nov", marks: 74 },
  { month: "Dec", marks: 79 }, { month: "Jan", marks: 82 },
];

const subjectMarks = [
  { subject: "DBMS", marks: 82, color: "#3b82f6" },
  { subject: "OS", marks: 76, color: "#6366f1" },
  { subject: "Networks", marks: 68, color: "#f59e0b" },
  { subject: "ML", marks: 71, color: "#ef4444" },
  { subject: "Math III", marks: 65, color: "#f87171" },
];

const todaySchedule = [
  { time: "09:00 AM", subject: "DBMS", room: "LH-203", type: "Lecture", status: "upcoming" },
  { time: "11:00 AM", subject: "OS Lab", room: "Lab-04", type: "Lab", status: "upcoming" },
  { time: "02:00 PM", subject: "Machine Learning", room: "LH-105", type: "Lecture", status: "upcoming" },
  { time: "04:00 PM", subject: "Networks", room: "LH-302", type: "Tutorial", status: "upcoming" },
];

const urgentTasks = [
  { label: "Assignment #4 – DBMS Project", due: "Tonight 11:59 PM", type: "assignment", urgent: true },
  { label: "ML Internal Quiz", due: "Tomorrow 10:00 AM", type: "quiz", urgent: true },
  { label: "Submit Lab Report – OS", due: "Jan 26", type: "lab", urgent: false },
];

const weeklyGoals = [
  { goal: "Attend all 4 ML lectures", done: false },
  { goal: "Submit Assignment #4", done: false },
  { goal: "Complete 15 study hours", done: true },
  { goal: "Score >70% in ML Quiz", done: false },
  { goal: "Increase LMS logins to 5x/week", done: true },
];

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Student";

  const kpiCards = [
    { label: "CGPA", value: "8.24", sub: "Semester 5", icon: <GraduationCap size={20} />, color: "blue", trend: "+0.12 ↑" },
    { label: "Attendance", value: "78%", sub: "Avg all subjects", icon: <CalendarCheck size={20} />, color: "emerald", trend: "+6% this week" },
    { label: "Dropout Risk", value: "14%", sub: "Low Risk", icon: <AlertTriangle size={20} />, color: "amber", trend: "Stable" },
    { label: "Assignments", value: "86%", sub: "Completion rate", icon: <BookOpen size={20} />, color: "purple", trend: "1 pending" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="space-y-6">
      {/* AI Morning Summary */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full" />
          <div className="absolute bottom-0 left-24 w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={18} className="text-blue-200" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">AI Success Coach · Good Morning</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Morning, {firstName}! 👋</h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
              Your attendance improved by <strong>6%</strong> this week — great progress! Assignment completion is excellent at 86%.
              However, <strong>Machine Learning attendance dropped to 68%</strong> — you need 8 more classes to reach 75%.
              Complete <strong>Assignment #4</strong> tonight and prepare for the <strong>ML Quiz tomorrow</strong>.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/student/assignments" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                View Assignments <ArrowRight size={12} />
              </Link>
              <Link href="/student/risk" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                AI Coach <ArrowRight size={12} />
              </Link>
              <Link href="/student/attendance" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                Attendance <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="text-center bg-white/15 rounded-2xl p-5 flex-shrink-0">
            <p className="text-4xl font-black">14%</p>
            <p className="text-xs text-blue-200 font-medium mt-1">Dropout Risk</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 bg-emerald-400/30 text-emerald-200 rounded-full">🟢 Low Risk</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${colorMap[card.color]}`}>
              {card.icon}
            </div>
            <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{card.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-slate-400">{card.sub}</p>
              <span className="text-[10px] font-semibold text-emerald-600">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Study Streak Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">🔥</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-orange-900">7-Day Study Streak!</p>
          <p className="text-xs text-orange-600 mt-0.5">You've logged in every day this week. Keep it going to maintain your streak!</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div key={d} className="w-7 h-7 rounded-lg bg-orange-400 text-white text-[9px] font-bold flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Attendance Trend</h3>
            <span className="text-xs text-emerald-600 font-semibold">+6% ↑</span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[60, 90]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marks Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Marks Trend</h3>
            <span className="text-xs text-blue-600 font-semibold">82 latest</span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marksTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[60, 90]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                <Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Marks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Subject Scores</h3>
          <div className="space-y-2.5">
            {subjectMarks.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{s.subject}</span>
                  <span className={`font-bold ${s.marks < 70 ? "text-red-500" : "text-slate-700"}`}>{s.marks}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.marks}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today + Urgent Tasks + Weekly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={15} className="text-blue-500" /> Today's Schedule
          </h3>
          <div className="space-y-3">
            {todaySchedule.map((cls, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-bold text-slate-500">{cls.time}</p>
                </div>
                <div className="flex-1 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-900">{cls.subject}</p>
                  <p className="text-[10px] text-blue-500">{cls.room} · {cls.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={15} className="text-amber-500" /> Urgent Tasks
          </h3>
          <div className="space-y-3">
            {urgentTasks.map((task, i) => (
              <div key={i} className={`p-3 rounded-xl border ${task.urgent ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                <p className={`text-xs font-semibold ${task.urgent ? "text-red-800" : "text-slate-700"}`}>{task.label}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${task.urgent ? "text-red-500" : "text-slate-400"}`}>Due: {task.due}</p>
              </div>
            ))}
          </div>
          <Link href="/student/assignments" className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
            View All Assignments <ChevronRight size={12} />
          </Link>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={15} className="text-purple-500" /> Weekly Goals
          </h3>
          <div className="space-y-2.5">
            {weeklyGoals.map((g, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {g.done
                  ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <Circle size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />}
                <p className={`text-xs font-medium leading-snug ${g.done ? "line-through text-slate-400" : "text-slate-700"}`}>{g.goal}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress</span>
              <span className="font-bold text-blue-600">2/5 done</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "View Assignments", href: "/student/assignments", icon: "📝", color: "blue" },
            { label: "AI Coach", href: "/student/risk", icon: "🤖", color: "purple" },
            { label: "Attendance", href: "/student/attendance", icon: "📅", color: "emerald" },
            { label: "Courses", href: "/student/courses", icon: "📚", color: "indigo" },
            { label: "Career & Skills", href: "/student/career", icon: "🎯", color: "amber" },
            { label: "Contact Faculty", href: "/student/messages", icon: "💬", color: "pink" },
          ].map((action, i) => (
            <Link key={i} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center group">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-[10px] font-semibold text-slate-600 group-hover:text-blue-700 leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
