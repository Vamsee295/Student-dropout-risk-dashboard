"use client";

import { useMemo } from "react";
import {
  GraduationCap, TrendingUp, CalendarCheck, AlertTriangle,
  BookOpen, Clock, ArrowRight, CheckCircle2,
  Circle, ChevronRight, Cpu, Target, Zap, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line,
} from "recharts";
import { useStudent } from "@/hooks/useStudent";
import { DashboardPageSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

// Subject chart colors
const SUBJECT_COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#ef4444", "#f87171"];

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Student";

  const {
    overview, assignments, risk,
    attendanceTrend, marksTrend,
    isLoading, isRefreshing, error, refetch,
  } = useStudent();

  // ─── Derived KPI cards ───────────────────────────────────────────────────
  const kpiCards = useMemo(() => {
    if (!overview || !assignments || !risk) return null;
    return [
      {
        label: "CGPA",
        value: (overview?.cgpa ?? 0).toFixed(2),
        sub: "Current Semester",
        icon: <GraduationCap size={20} />,
        color: "blue",
        trend: "+0.12 ↑",
      },
      {
        label: "Attendance",
        value: `${(overview?.attendance_rate ?? 0).toFixed(1)}%`,
        sub: "Avg all subjects",
        icon: <CalendarCheck size={20} />,
        color: "emerald",
        trend: (overview?.attendance_rate ?? 0) >= 75 ? "✓ On track" : "⚠ Below 75%",
      },
      {
        label: "Dropout Risk",
        value: `${(overview?.dropout_probability ?? 0).toFixed(1)}%`,
        sub: overview?.risk_level ?? "Low Risk",
        icon: <AlertTriangle size={20} />,
        color: (overview?.dropout_probability ?? 0) > 50 ? "red" : (overview?.dropout_probability ?? 0) > 30 ? "amber" : "emerald",
        trend: overview?.risk_trend === "up" ? "↑ Increasing" : overview?.risk_trend === "down" ? "↓ Improving" : "→ Stable",
      },
      {
        label: "Assignments",
        value: `${assignments.completion_percentage}%`,
        sub: "Completion rate",
        icon: <BookOpen size={20} />,
        color: "purple",
        trend: assignments.overdue_count > 0 ? `${assignments.overdue_count} overdue` : "All submitted",
      },
    ];
  }, [overview, assignments, risk]);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  // ─── Subject scores derived from assignments ─────────────────────────────
  const subjectScores = useMemo(() => {
    if (!assignments?.assignments) return [];
    const graded = assignments.assignments
      .filter((a) => a.status === "Graded" && a.obtained_marks !== null)
      .slice(0, 5)
      .map((a, i) => ({
        subject: a.assessment.course_id,
        marks: Math.round(((a.obtained_marks ?? 0) / a.assessment.total_marks) * 100),
        color: SUBJECT_COLORS[i] || "#6366f1",
      }));
    // Pad with mock if insufficient graded assignments
    if (graded.length === 0) {
      return [
        { subject: "DBMS", marks: 82, color: "#3b82f6" },
        { subject: "OS", marks: 76, color: "#6366f1" },
        { subject: "Networks", marks: 68, color: "#f59e0b" },
        { subject: "ML", marks: 71, color: "#ef4444" },
        { subject: "Math III", marks: 65, color: "#f87171" },
      ];
    }
    return graded;
  }, [assignments]);

  // ─── Loading & Error states ──────────────────────────────────────────────
  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return <ErrorState title="Dashboard unavailable" message={error} onRetry={refetch} fullPage />;

  const studyStreakDays = overview?.study_streak_days ?? 7;
  const dropoutRisk = overview?.dropout_probability?.toFixed(1) ?? "14";
  const riskLevel = overview?.risk_level ?? "Low Risk";
  const riskBadgeColor = riskLevel.toLowerCase().includes("high")
    ? "bg-red-400/30 text-red-200"
    : riskLevel.toLowerCase().includes("moderate")
    ? "bg-amber-400/30 text-amber-200"
    : "bg-emerald-400/30 text-emerald-200";

  const urgentTasks = overview?.upcoming_deadlines ?? [];
  const weeklyGoals = [
    { goal: "Attend all 4 ML lectures", done: (overview?.attendance_rate ?? 0) >= 75 },
    { goal: "Submit pending assignments", done: (assignments?.overdue_count ?? 1) === 0 },
    { goal: "Complete 15 study hours", done: studyStreakDays >= 5 },
    { goal: "Score >70% in assessments", done: (overview?.avg_marks ?? 0) >= 70 },
    { goal: "Increase LMS logins to 5x/week", done: studyStreakDays >= 5 },
  ];
  const goalsCompleted = weeklyGoals.filter((g) => g.done).length;

  return (
    <div className="space-y-6">
      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
          <RefreshCw size={12} className="animate-spin" /> Refreshing…
        </div>
      )}

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
              Your attendance is at <strong>{(overview?.attendance_rate ?? 0).toFixed(1)}%</strong>
              {(overview?.attendance_rate ?? 0) < 75 ? " — below the 75% threshold. Attend more classes to stay on track." : " — great work!"}
              {" "}Assignment completion is at <strong>{assignments?.completion_percentage}%</strong>.
              {(assignments?.overdue_count ?? 0) > 0 && <> You have <strong>{assignments?.overdue_count} overdue</strong> submissions.</>}
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
            <p className="text-4xl font-black">{dropoutRisk}%</p>
            <p className="text-xs text-blue-200 font-medium mt-1">Dropout Risk</p>
            <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${riskBadgeColor}`}>
              {riskLevel.toLowerCase().includes("high") ? "🔴" : riskLevel.toLowerCase().includes("moderate") ? "🟡" : "🟢"} {riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(kpiCards ?? []).map((card, i) => (
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
          <p className="text-sm font-bold text-orange-900">{studyStreakDays}-Day Study Streak!</p>
          <p className="text-xs text-orange-600 mt-0.5">You've logged in every day this week. Keep it going to maintain your streak!</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {Array.from({ length: studyStreakDays }).map((_, d) => (
            <div key={d} className="w-7 h-7 rounded-lg bg-orange-400 text-white text-[9px] font-bold flex items-center justify-center">
              {d + 1}
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
            <span className="text-xs text-emerald-600 font-semibold">
              {(attendanceTrend ?? []).length > 0
                ? `${((attendanceTrend as {week:string;value:number}[])[attendanceTrend!.length - 1]?.value ?? 0)}% latest`
                : "Loading…"}
            </span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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
            <span className="text-xs text-blue-600 font-semibold">
              {(marksTrend ?? []).length > 0
                ? `${(marksTrend as {month:string;marks:number}[])[marksTrend!.length - 1]?.marks} latest`
                : "Loading…"}
            </span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marksTrend ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[60, 90]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                <Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Scores */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Subject Scores</h3>
          <div className="space-y-2.5">
            {subjectScores.map((s, i) => (
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
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={15} className="text-blue-500" /> Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {(urgentTasks.length > 0 ? urgentTasks : [
              { id: 1, course_name: "No upcoming tasks", title: "All caught up!", due_date: "", type: "info", urgent: false },
            ]).slice(0, 4).map((task, i) => (
              <div key={i} className={`p-2.5 rounded-xl border ${task.urgent ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
                <p className={`text-xs font-bold ${task.urgent ? "text-red-900" : "text-blue-900"}`}>{task.title}</p>
                <p className={`text-[10px] mt-0.5 ${task.urgent ? "text-red-500" : "text-blue-500"}`}>
                  {"course_name" in task ? task.course_name : ""} · {"due_date" in task && task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Tasks (Assignments) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={15} className="text-amber-500" /> Assignments Due
          </h3>
          <div className="space-y-3">
            {(assignments?.assignments ?? []).filter((a) => a.status === "Pending" || a.status === "Overdue").slice(0, 3).map((task, i) => (
              <div key={i} className={`p-3 rounded-xl border ${task.status === "Overdue" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                <p className={`text-xs font-semibold ${task.status === "Overdue" ? "text-red-800" : "text-slate-700"}`}>{task.assessment.title}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${task.status === "Overdue" ? "text-red-500" : "text-slate-400"}`}>
                  {task.assessment.course_name} · Due: {task.assessment.due_date ? new Date(task.assessment.due_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
            {(assignments?.assignments ?? []).filter((a) => a.status === "Pending" || a.status === "Overdue").length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">🎉 All assignments submitted!</p>
            )}
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
              <span className="font-bold text-blue-600">{goalsCompleted}/{weeklyGoals.length} done</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(goalsCompleted / weeklyGoals.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "View Assignments", href: "/student/assignments", icon: "📝" },
            { label: "AI Coach", href: "/student/risk", icon: "🤖" },
            { label: "Attendance", href: "/student/attendance", icon: "📅" },
            { label: "Courses", href: "/student/courses", icon: "📚" },
            { label: "Career & Skills", href: "/student/career", icon: "🎯" },
            { label: "Contact Faculty", href: "/student/messages", icon: "💬" },
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
