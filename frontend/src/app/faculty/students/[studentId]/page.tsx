"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown,
  CalendarCheck, BookOpen, Star, Activity, ChevronRight,
  MessageSquare, ClipboardList, Phone, Mail, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import apiClient from "@/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudentOverview {
  id: string;
  name: string;
  avatar: string;
  course: string;
  department: string;
  section: string;
  advisor: string;
  riskStatus: string;
  riskTrend: string;
  riskValue: string;
  attendance: number;
  cgpa: number;
  engagementScore: number;
  lastInteraction: string;
  primaryRiskDriver: string;
}

interface AttendanceTrendPoint { week: string; attendance: number; }
interface MarksTrendPoint { month: string; marks: number; }
interface RiskData { risk_score: number; risk_level: string; risk_trend?: string; explanation?: string; risk_factors?: string[]; }
interface Subject {
  course_id: string;
  course_name: string;
  credits: number;
  total_marks: number;
  grade: string;
  attendance_percentage: number;
}
interface SemesterPerf { semester: number; gpa: number; subjects: Subject[]; }
interface AttendanceRecord { id: number; course_id: string; course_name: string; date: string; status: string; }
interface AssignmentSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_percentage: number;
  overdue_count: number;
}

const riskColor = (level: string) => {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("high")) return { badge: "bg-red-100 text-red-700 border-red-200", dot: "#ef4444" };
  if (l.includes("moderate") || l.includes("medium")) return { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "#f59e0b" };
  return { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "#10b981" };
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();

  const [overview, setOverview] = useState<StudentOverview | null>(null);
  const [marksTrend, setMarksTrend] = useState<MarksTrendPoint[]>([]);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [performance, setPerformance] = useState<SemesterPerf[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignmentSummary, setAssignmentSummary] = useState<AssignmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    const id = studentId;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          apiClient.get(`/student/${id}/overview`),
          apiClient.get(`/student/${id}/marks-trend`),
          apiClient.get(`/student/${id}/risk`),
          apiClient.get(`/student/${id}/performance`),
          apiClient.get(`/student/${id}/attendance`),
          apiClient.get(`/student/${id}/assignments`),
        ]);

        const [ov, marks, rsk, perf, att, asgn] = results;
        if (ov.status === "fulfilled") setOverview(ov.value.data);
        else { setError("Failed to load student profile."); return; }
        if (marks.status === "fulfilled") setMarksTrend(marks.value.data ?? []);
        if (rsk.status === "fulfilled") setRisk(rsk.value.data ?? null);
        if (perf.status === "fulfilled") setPerformance(perf.value.data ?? []);
        if (att.status === "fulfilled") setAttendance(att.value.data ?? []);
        if (asgn.status === "fulfilled") setAssignmentSummary(asgn.value.data ?? null);
      } catch {
        setError("Failed to load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [studentId]);

  // ─── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-slate-500 text-sm">Loading student profile…</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-400" />
        <p className="text-slate-700 font-semibold text-lg">{error ?? "Student not found"}</p>
        <Link href="/faculty/students" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Students
        </Link>
      </div>
    );
  }

  const riskVal = risk?.risk_score ?? parseFloat(overview.riskValue ?? "0");
  const riskLevel = risk?.risk_level ?? overview.riskStatus ?? "Safe";
  const colors = riskColor(riskLevel);

  // KPI cards
  const kpis = [
    {
      label: "Risk Score", value: `${riskVal.toFixed(1)}%`,
      sub: riskLevel,
      icon: <AlertTriangle size={18} />,
      colorClass: riskVal > 70 ? "bg-red-50 text-red-600 border-red-100"
        : riskVal > 45 ? "bg-amber-50 text-amber-600 border-amber-100"
        : "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Attendance", value: `${(overview.attendance ?? 0).toFixed(1)}%`,
      sub: overview.attendance >= 75 ? "On track" : "Below 75%",
      icon: <CalendarCheck size={18} />,
      colorClass: overview.attendance >= 75
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-red-50 text-red-600 border-red-100",
    },
    {
      label: "CGPA", value: (overview.cgpa ?? 0).toFixed(2),
      sub: "Current semester",
      icon: <Star size={18} />,
      colorClass: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Engagement", value: `${(overview.engagementScore ?? 0).toFixed(0)}%`,
      sub: "LMS activity score",
      icon: <Activity size={18} />,
      colorClass: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  // Gauge data for risk donut
  const gaugeData = [
    { name: "Risk", value: riskVal, fill: colors.dot },
    { name: "Safe", value: 100 - riskVal, fill: "#f1f5f9" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <nav className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
            <Link href="/faculty/students" className="hover:text-indigo-600">Students</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-medium">{overview.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        </div>
      </div>

      {/* ── Identity Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
            {overview.name.charAt(0)}
          </div>

          {/* Name & Meta */}
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{overview.name}</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors.badge}`}>
                {riskLevel}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {overview.id} · {overview.department} · {overview.section}
            </p>
            <p className="text-xs text-slate-400 mt-1">Advisor: {overview.advisor ?? "Unassigned"} · Last active: {overview.lastInteraction}</p>
            {overview.primaryRiskDriver && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 w-fit">
                <AlertTriangle size={13} />
                <span>Primary risk driver: <strong>{overview.primaryRiskDriver}</strong></span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              <MessageSquare size={14} /> Message
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
              <ClipboardList size={14} /> Intervene
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm">
              <Phone size={14} /> Contact Parent
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${k.colorClass}`}>
              {k.icon}
            </div>
            <p className="text-xs text-slate-500 font-medium">{k.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Recent Attendance</h3>
          {attendance.length > 0 ? (
            <div className="space-y-2">
              {attendance.slice(0, 6).map((rec, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{rec.course_name}</p>
                    <p className="text-xs text-slate-400">{new Date(rec.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                    rec.status === 'Absent' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-slate-400 text-sm">No attendance records available.</p>
            </div>
          )}
        </div>

        {/* Risk Gauge */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-900 mb-3 self-start">Dropout Risk</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  startAngle={220} endAngle={-40}
                  cx="50%" cy="55%"
                  innerRadius={50} outerRadius={70}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {gaugeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
              <span className="text-2xl font-black" style={{ color: colors.dot }}>{riskVal.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Risk Score</span>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-bold border ${colors.badge}`}>
            {riskLevel}
          </div>
          {risk?.risk_factors && risk.risk_factors.length > 0 && (
            <div className="mt-4 w-full space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Factors</p>
              {risk.risk_factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Marks Trend ── */}
      {marksTrend.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Marks Trend</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksTrend} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Bar dataKey="marks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Assignment Summary ── */}
      {assignmentSummary && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-500" /> Assignment Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total", value: assignmentSummary.total, color: "text-slate-800" },
              { label: "Completed", value: assignmentSummary.completed, color: "text-emerald-600" },
              { label: "Pending", value: assignmentSummary.pending, color: "text-amber-600" },
              { label: "Overdue", value: assignmentSummary.overdue, color: "text-red-600" },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Completion Rate</span>
              <span className="font-semibold text-slate-700">{assignmentSummary.completion_percentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${assignmentSummary.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Subject Performance ── */}
      {performance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            Subject Performance — Semester {performance[performance.length - 1].semester}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Course", "Credits", "Score", "Grade", "Attendance"].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performance[performance.length - 1].subjects.map((subj, i) => {
                  const gradeColor = subj.grade.startsWith('A') ? 'bg-emerald-50 text-emerald-700'
                    : subj.grade.startsWith('B') ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700';
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-800 text-sm">{subj.course_name}</p>
                        <p className="text-xs text-slate-400">{subj.course_id}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-sm">{subj.credits}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(subj.total_marks, 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">{subj.total_marks.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${gradeColor}`}>{subj.grade}</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-semibold ${
                          subj.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-red-600'
                        }`}>{subj.attendance_percentage.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
