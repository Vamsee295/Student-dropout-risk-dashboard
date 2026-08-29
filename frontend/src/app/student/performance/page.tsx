"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Award, BookOpen, AlertTriangle, Star, Brain, Loader2 } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import apiClient from "@/api/axios";

interface PerformanceData {
  overall_percentage: number;
  total_assessments: number;
  courses: {
    course_id: string;
    course_name: string;
    avg_percentage: number;
    assessments: {
      assessment_type: string;
      obtained_marks: number;
      total_marks: number;
      percentage: number;
    }[];
  }[];
  items: {
    id: number;
    course_id: string;
    course_name: string;
    assessment_title: string;
    assessment_type: string;
    obtained_marks: number;
    total_marks: number;
    percentage: number;
    rubric: {
      writing: number;
      understanding: number;
      learning: number;
      application: number;
      knowledge: number;
    } | null;
    graded_at: string | null;
  }[];
}

// Static GPA trend — will be from DB in future phases
const semesterGPA = [
  { sem: "S1", gpa: 7.8 }, { sem: "S2", gpa: 8.1 }, { sem: "S3", gpa: 7.9 },
  { sem: "S4", gpa: 8.4 }, { sem: "S5", gpa: 8.24 },
];

function gradeFromPct(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "B-";
  return "C";
}

const gradeColors: Record<string, string> = {
  "A+": "#10b981", "A": "#10b981", "B+": "#3b82f6", "B": "#6366f1", "B-": "#f59e0b", "C": "#ef4444",
};

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: res } = await apiClient.get("/grades/student/performance");
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // WebSocket for realtime updates
    let ws: WebSocket | null = null;
    const connectWs = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : (host === "localhost" ? ":8000" : "");
      
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      try {
        const user = JSON.parse(userStr);
        ws = new WebSocket(`${protocol}//${host}${port}/api/v1/ws/student_${user.student_id}?token=${token}`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "assessment_graded") {
              loadData(); // Refresh on grading event
            }
          } catch (e) {}
        };
        
        ws.onclose = () => setTimeout(connectWs, 3000);
      } catch (e) {}
    };
    
    connectWs();
    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  const overallPct = data?.overall_percentage ?? 0;
  const below70Count = (data?.courses ?? []).filter((c) => c.avg_percentage < 70).length;

  // Build radar data from courses
  const radarData = (data?.courses ?? []).map((c) => ({
    subject: c.course_id,
    A: Math.round(c.avg_percentage),
  }));

  // Build subjects table from courses
  const subjectsTable = (data?.courses ?? []).map((c) => {
    const internal = c.assessments.filter((a) => a.assessment_type === "Internal").reduce((s, a) => s + a.obtained_marks, 0);
    const external = c.assessments.filter((a) => a.assessment_type === "External").reduce((s, a) => s + a.obtained_marks, 0);
    const lab = c.assessments.filter((a) => a.assessment_type === "Lab").reduce((s, a) => s + a.obtained_marks, 0);
    const total = c.assessments.reduce((s, a) => s + a.obtained_marks, 0);
    const maxTotal = c.assessments.reduce((s, a) => s + a.total_marks, 0);
    const pct = c.avg_percentage;
    const grade = gradeFromPct(pct);
    return { name: c.course_id, full_name: c.course_name, internal, external, lab, total, max: maxTotal, grade, pct };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Performance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Semester 5 · Live from database</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", value: loading ? "…" : `${overallPct}%`, icon: <Star size={20} />, color: "blue" },
          { label: "CGPA (Est.)", value: loading ? "…" : (overallPct / 10).toFixed(2), icon: <Award size={20} />, color: "purple" },
          { label: "Total Assessments", value: loading ? "…" : data?.total_assessments ?? 0, icon: <BookOpen size={20} />, color: "emerald" },
          { label: "Subjects Below Avg", value: loading ? "…" : below70Count, icon: <AlertTriangle size={20} />, color: "red" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "purple" ? "bg-purple-50 text-purple-600" :
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-blue-400" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Subject Breakdown */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Subject-wise Marks Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              {subjectsTable.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">No graded assessments yet. Check back after your faculty uploads marks.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Subject</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Internal</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">External</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Lab</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Total</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Grade</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subjectsTable.map((s, i) => (
                      <tr key={i} className={`hover:bg-slate-50 transition-colors ${s.pct < 70 ? "bg-amber-50/30" : ""}`}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.full_name}</p>
                        </td>
                        <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.internal > 0 ? s.internal : "—"}</td>
                        <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.external > 0 ? s.external : "—"}</td>
                        <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">{s.lab > 0 ? s.lab : "—"}</td>
                        <td className="px-3 py-4 text-center">
                          <span className="text-sm font-bold text-slate-900">{s.total}</span>
                          <span className="text-xs text-slate-400">/{s.max}</span>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="text-sm font-black" style={{ color: gradeColors[s.grade] || "#6366f1" }}>{s.grade}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full max-w-[120px]">
                            <div className="h-full rounded-full" style={{
                              width: `${s.pct}%`,
                              backgroundColor: s.pct < 70 ? "#f59e0b" : s.pct >= 80 ? "#10b981" : "#3b82f6"
                            }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{s.pct}%</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* GPA trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-5">Semester GPA Trend</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semesterGPA} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis domain={[7, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}`, "GPA"]} />
                    <Line type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3">Skill Radar</h3>
              <div className="h-[200px]">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-slate-400">No data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-blue-600" />
              <h3 className="font-bold text-blue-900">AI Performance Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: "💪", text: "You perform consistently well in programming-based subjects. Keep building on this strength." },
                { icon: "⚠️", text: below70Count > 0 ? `${below70Count} subject(s) are below 70%. Focus extra study time on those areas.` : "All subjects are above average — great work!" },
                { icon: "💡", text: "Submit all pending assignments to boost your completion score and overall GPA." },
              ].map((insight, i) => (
                <div key={i} className="bg-white rounded-xl border border-blue-100 p-4">
                  <p className="text-xl mb-2">{insight.icon}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment History with Rubric */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Recent Assessments & Feedback</h3>
            </div>
            <div className="p-5 space-y-4">
              {(data?.items ?? []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No graded assessments to display.</p>
              ) : (
                [...(data?.items ?? [])].sort((a, b) => new Date(b.graded_at || 0).getTime() - new Date(a.graded_at || 0).getTime()).map((item, i) => (
                  <div key={item.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 uppercase">{item.assessment_type}</span>
                          <span className="text-xs font-semibold text-slate-500">{item.course_id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.assessment_title}</h4>
                        {item.graded_at && <p className="text-[10px] text-slate-400 mt-0.5">Graded: {new Date(item.graded_at).toLocaleDateString()}</p>}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-xl font-black" style={{ color: gradeColors[gradeFromPct(item.percentage)] || "#6366f1" }}>{item.obtained_marks}</p>
                          <p className="text-[10px] text-slate-400">/ {item.total_marks}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: gradeColors[gradeFromPct(item.percentage)] || "#6366f1" }}>
                          {gradeFromPct(item.percentage)}
                        </div>
                      </div>
                    </div>

                    {item.rubric && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Rubric Feedback</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            { label: "Writing", val: item.rubric.writing },
                            { label: "Understanding", val: item.rubric.understanding },
                            { label: "Learning", val: item.rubric.learning },
                            { label: "Application", val: item.rubric.application },
                            { label: "Knowledge", val: item.rubric.knowledge },
                          ].map(r => (
                            <div key={r.label} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                              <p className="text-[10px] text-slate-500 mb-0.5">{r.label}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-700">{r.val}</span>
                                <span className="text-[9px] text-slate-400">/ 10</span>
                              </div>
                              <div className="h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(r.val / 10) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
