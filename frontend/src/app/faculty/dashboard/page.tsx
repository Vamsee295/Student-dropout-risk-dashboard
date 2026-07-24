"use client";

import { useEffect, useState } from "react";
import { facultyService } from "@/services/faculty";
import apiClient from "@/lib/api";
import {
  Users, AlertTriangle, TrendingUp, BookOpen, ClipboardCheck,
  Bell, CalendarClock, Loader2, ChevronRight, Activity,
  BarChart2, FileText, MessageSquare, CalendarDays, ArrowUpRight,
  ShieldAlert, CheckCircle2, Clock, Zap, RefreshCw, Brain,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import Link from "next/link";

interface FacultyOverview {
  total_students: number;
  high_risk_count: number;
  average_attendance: number;
  average_risk_score: number;
  high_risk_department: string | null;
  risk_distribution: Record<string, number>;
}

interface DeptAnalytics {
  department: string;
  total_students: number;
  avg_risk_score: number;
  avg_attendance: number;
  high_risk_count: number;
}

const RISK_COLORS: Record<string, string> = {
  "High Risk": "#EF4444",
  "Moderate Risk": "#F59E0B",
  "Stable": "#6366F1",
  "Safe": "#10B981",
};

const attendanceTrendData = [
  { week: "Week 1", attendance: 88 },
  { week: "Week 2", attendance: 84 },
  { week: "Week 3", attendance: 81 },
  { week: "Week 4", attendance: 79 },
  { week: "Week 5", attendance: 76 },
  { week: "Week 6", attendance: 72 },
  { week: "Week 7", attendance: 75 },
  { week: "Week 8", attendance: 73 },
];

const weeklyActivityData = [
  { day: "Mon", submissions: 24, attendance: 91 },
  { day: "Tue", submissions: 18, attendance: 87 },
  { day: "Wed", submissions: 32, attendance: 89 },
  { day: "Thu", submissions: 11, attendance: 76 },
  { day: "Fri", submissions: 40, attendance: 84 },
];

const atRiskStudents = [
  { name: "Arjun Mehta", roll: "21CS001", risk: 92, attendance: 51, subject: "CS301" },
  { name: "Priya Sharma", roll: "21CS047", risk: 88, attendance: 58, subject: "CS302" },
  { name: "Rohit Kumar", roll: "21CS023", risk: 84, attendance: 63, subject: "CS303" },
  { name: "Kavya Reddy", roll: "21CS089", risk: 82, attendance: 67, subject: "CS301" },
  { name: "Sanjay Patel", roll: "21CS012", risk: 81, attendance: 69, subject: "HS101" },
];

const todaysClasses = [
  { time: "09:00", subject: "Database Management", room: "LH-203", students: 62 },
  { time: "11:00", subject: "Operating Systems", room: "LH-105", students: 58 },
  { time: "14:00", subject: "Lab Session – CS303", room: "Lab-04", students: 30 },
];

const pendingTasks = [
  { task: "Grade DBMS Mid-Term papers", count: 43, urgency: "high", due: "2 days" },
  { task: "Mark attendance for CS302", count: 1, urgency: "high", due: "Today" },
  { task: "Review OS Assignment submissions", count: 28, urgency: "medium", due: "4 days" },
  { task: "Approve Intervention – Arjun Mehta", count: 1, urgency: "medium", due: "Today" },
];

export default function FacultyDashboard() {
  const [overview, setOverview] = useState<FacultyOverview | null>(null);
  const [deptData, setDeptData] = useState<DeptAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, analyticsRes] = await Promise.all([
          facultyService.getOverview(),
          apiClient.get("/faculty/analytics/department"),
        ]);
        setOverview(overviewData as FacultyOverview);
        setDeptData(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
      } catch (error) {
        console.error("Failed to fetch faculty dashboard data:", error);
        // Use fallback data
        setOverview({
          total_students: 248,
          high_risk_count: 22,
          average_attendance: 76,
          average_risk_score: 38,
          high_risk_department: "CSE",
          risk_distribution: { "High Risk": 22, "Moderate Risk": 51, "Stable": 89, "Safe": 86 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await facultyService.recalculateRisk();
      const overviewData = await facultyService.getOverview();
      setOverview(overviewData as FacultyOverview);
    } catch (error) {
      console.error("Recalculation failed:", error);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const pieData = Object.entries(overview?.risk_distribution || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: RISK_COLORS[name] || "#6B7280" }));

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl px-6 py-5 text-white shadow-lg shadow-emerald-900/20">
        <div>
          <p className="text-emerald-200 text-sm font-medium">{dateStr} · {timeStr}</p>
          <h1 className="text-2xl font-bold mt-1">Good morning, Professor!</h1>
          <p className="text-emerald-100 text-sm mt-1">You have <span className="font-semibold text-white">3 classes</span> today and <span className="font-semibold text-white">{overview?.high_risk_count ?? 22} students</span> need attention.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/faculty/attendance" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <ClipboardCheck size={16} /> Take Attendance
          </Link>
          <button onClick={handleRecalculate} disabled={recalculating} className="flex items-center gap-2 bg-white text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={recalculating ? "animate-spin" : ""} />
            {recalculating ? "Recalculating..." : "Refresh Risk"}
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Students" value={overview?.total_students ?? 248} color="blue" sub="Across all courses" href="/faculty/students" />
        <StatCard icon={<AlertTriangle size={22} />} label="At-Risk Students" value={overview?.high_risk_count ?? 22} color="red" sub={`${Math.round(((overview?.high_risk_count ?? 22) / (overview?.total_students ?? 248)) * 100)}% of total`} href="/faculty/students/at-risk" />
        <StatCard icon={<Activity size={22} />} label="Avg. Attendance" value={`${Math.round(overview?.average_attendance ?? 76)}%`} color="emerald" sub="Target: 75%" href="/faculty/attendance" />
        <StatCard icon={<BarChart2 size={22} />} label="Avg. Risk Score" value={`${Math.round(overview?.average_risk_score ?? 38)}%`} color="purple" sub="AI-calculated" href="/faculty/ai-risk-center" />
      </div>

      {/* ── AI Summary & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">AI Academic Summary</h3>
              <p className="text-xs text-slate-400">Updated moments ago · Powered by EduRisk ML</p>
            </div>
            <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold px-2 py-1 rounded-full">LIVE</span>
          </div>

          <div className="space-y-3">
            {[
              { icon: <ShieldAlert size={15} className="text-red-500" />, text: `${overview?.high_risk_count ?? 22} students flagged as High Risk — immediate intervention recommended`, level: "critical" },
              { icon: <TrendingUp size={15} className="text-amber-500" />, text: "Attendance dropped 9% over the last 3 weeks — review Week 6 schedule", level: "warning" },
              { icon: <FileText size={15} className="text-blue-500" />, text: "Assignment completion rate fell to 61% — 'Database Design Project' has lowest rate (34%)", level: "info" },
              { icon: <Brain size={15} className="text-purple-500" />, text: "2 students (Arjun Mehta, Priya Sharma) predicted to drop out within 30 days", level: "critical" },
              { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "3 students who received interventions last month showed 15%+ attendance improvement", level: "success" },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                item.level === "critical" ? "bg-red-50 border border-red-100" :
                item.level === "warning" ? "bg-amber-50 border border-amber-100" :
                item.level === "success" ? "bg-emerald-50 border border-emerald-100" :
                "bg-slate-50 border border-slate-100"
              }`}>
                <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                <p className={`${
                  item.level === "critical" ? "text-red-800" :
                  item.level === "warning" ? "text-amber-800" :
                  item.level === "success" ? "text-emerald-800" :
                  "text-slate-700"
                }`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" /> Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: "Take Attendance", icon: <ClipboardCheck size={16} />, href: "/faculty/attendance", color: "emerald" },
              { label: "Upload Marks", icon: <TrendingUp size={16} />, href: "/faculty/assessments", color: "blue" },
              { label: "View At-Risk Students", icon: <AlertTriangle size={16} />, href: "/faculty/students/at-risk", color: "red" },
              { label: "Generate Report", icon: <FileText size={16} />, href: "/faculty/reports", color: "purple" },
              { label: "Send Announcement", icon: <MessageSquare size={16} />, href: "/faculty/communication", color: "orange" },
              { label: "Schedule Meeting", icon: <CalendarDays size={16} />, href: "/faculty/schedule", color: "teal" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:border-slate-300">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
                <ChevronRight size={14} className="ml-auto text-slate-400 group-hover:text-slate-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Schedule & Pending Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock size={18} className="text-blue-500" /> Today's Classes
            </h3>
            <Link href="/faculty/schedule" className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
              Full Schedule <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {todaysClasses.map((cls, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-14 text-center">
                  <p className="text-xs font-bold text-slate-900">{cls.time}</p>
                  <p className="text-[10px] text-slate-400">AM</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{cls.subject}</p>
                  <p className="text-xs text-slate-400">{cls.room} · {cls.students} students</p>
                </div>
                <Link href="/faculty/attendance" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-medium hover:bg-emerald-100">
                  Attend
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell size={18} className="text-red-500" /> Pending Tasks
            </h3>
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                task.urgency === "high" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
              }`}>
                <Clock size={16} className={task.urgency === "high" ? "text-red-500 mt-0.5 flex-shrink-0" : "text-amber-500 mt-0.5 flex-shrink-0"} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.urgency === "high" ? "text-red-800" : "text-amber-800"}`}>{task.task}</p>
                  <p className={`text-xs mt-0.5 ${task.urgency === "high" ? "text-red-600" : "text-amber-600"}`}>Due: {task.due} {task.count > 1 ? `· ${task.count} items` : ""}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                  task.urgency === "high" ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"
                }`}>{task.urgency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Attendance Trend</h3>
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg font-medium">
              <TrendingUp size={12} className="rotate-180" /> Down 9% this month
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2.5} fill="url(#attGrad)" dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Risk Distribution</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} students`, String(n)]} contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Weekly Activity + At-Risk Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6">Weekly Activity</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="submissions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* At-Risk Students Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" /> Top At-Risk Students
            </h3>
            <Link href="/faculty/students/at-risk" className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Student</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Roll No.</th>
                  <th className="text-center py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Attendance</th>
                  <th className="text-center py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">Risk</th>
                  <th className="py-2 text-xs font-semibold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {atRiskStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{s.roll}</td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`text-xs font-bold ${s.attendance < 65 ? "text-red-600" : "text-amber-600"}`}>{s.attendance}%</span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        s.risk >= 85 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>{s.risk}%</span>
                    </td>
                    <td className="py-3">
                      <Link href={`/faculty/students/${s.roll.toLowerCase()}`} className="text-xs text-emerald-600 font-semibold hover:underline">
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, href }: {
  icon: React.ReactNode; label: string; value: string | number;
  color: "blue" | "red" | "emerald" | "purple"; sub?: string; href: string;
}) {
  const palette = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  }[color];

  return (
    <Link href={href} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all group block">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${palette.bg} ${palette.text} border ${palette.border}`}>{icon}</div>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Link>
  );
}
