"use client";

import {
  GraduationCap, Users, BookOpen, TrendingDown, TrendingUp,
  AlertTriangle, BrainCircuit, ArrowRight, CheckCircle2, Zap, Crown, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line,
  PieChart, Pie,
} from "recharts";
import { useDean } from "@/hooks/useDean";
import { DashboardPageSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

const QUICK_ACTIONS = [
  { label: "Generate Executive Report", href: "/dean/reports", icon: "📄" },
  { label: "Review High-Risk Depts", href: "/dean/departments", icon: "🏫" },
  { label: "Approve Intervention Plans", href: "/dean/ai-center", icon: "✅" },
  { label: "Send Institution Notice", href: "/dean/announcements", icon: "📢" },
  { label: "Review Faculty Performance", href: "/dean/faculty", icon: "👨‍🏫" },
  { label: "Check Budget Utilization", href: "/dean/budget", icon: "💰" },
  { label: "AI Forecasting Center", href: "/dean/forecasting", icon: "🔮" },
  { label: "Accreditation Status", href: "/dean/compliance", icon: "🏅" },
];

export default function DeanDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Dean";

  const {
    overview, departments, dropoutTrend, retentionTrend,
    riskDistribution, alerts,
    isLoading, isRefreshing, error, refetch,
  } = useDean();

  if (isLoading) return <DashboardPageSkeleton />;
  if (error) return <ErrorState title="Executive dashboard unavailable" message={error} onRetry={refetch} fullPage />;

  const kpis = [
    { label: "Total Students", value: overview?.total_students.toLocaleString() ?? "–", sub: `Across ${overview?.total_departments ?? 0} departments`, icon: <Users size={20} />, color: "violet", trend: "+3.2% YoY" },
    { label: "Total Faculty", value: String(overview?.total_faculty ?? "–"), sub: "Full-time + visiting", icon: <GraduationCap size={20} />, color: "blue", trend: "3 vacancies" },
    { label: "Dropout Rate", value: `${overview?.dropout_rate ?? "–"}%`, sub: "↓3% from last semester", icon: <TrendingDown size={20} />, color: "emerald", trend: "↓ Improving" },
    { label: "Retention Rate", value: `${overview?.retention_rate ?? "–"}%`, sub: "Above national avg", icon: <TrendingUp size={20} />, color: "teal", trend: "↑ 3.1%" },
    { label: "Graduation Rate", value: `${overview?.graduation_rate ?? "–"}%`, sub: "Target: 90%", icon: <GraduationCap size={20} />, color: "indigo", trend: "✓ On Target" },
    { label: "Placement Rate", value: `${overview?.placement_rate ?? "–"}%`, sub: "Top 10 in state", icon: <BookOpen size={20} />, color: "purple", trend: "↑ 6% YoY" },
    { label: "Avg Attendance", value: `${overview?.avg_attendance ?? "–"}%`, sub: "All departments", icon: <CheckCircle2 size={20} />, color: "sky", trend: "↑ 4%" },
    { label: "AI Risk Alerts", value: String((overview?.critical_alerts ?? 0) + (overview?.warning_alerts ?? 0)), sub: `${overview?.critical_alerts ?? 0} critical, ${overview?.warning_alerts ?? 0} warning`, icon: <AlertTriangle size={20} />, color: "red", trend: "Needs Action" },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  const deptChartData = (departments ?? []).map((d) => ({ dept: d.dept, risk: d.risk }));
  const activeAlertsList = alerts ?? [];
  const riskDist = riskDistribution ?? [];

  const healthScore = Math.round(
    ((overview?.retention_rate ?? 85) + (overview?.graduation_rate ?? 90) + (100 - (overview?.dropout_rate ?? 12))) / 3
  );

  return (
    <div className="space-y-6">
      {isRefreshing && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-violet-700 text-white text-xs font-semibold rounded-full shadow-lg">
          <RefreshCw size={12} className="animate-spin" /> Refreshing…
        </div>
      )}

      {/* AI Executive Summary Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-violet-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-0 left-32 w-40 h-40 bg-violet-400 rounded-full" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit size={18} className="text-violet-300" />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                AI Executive Intelligence · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Good morning, {firstName} 👑</h2>
            <p className="text-violet-100 text-sm leading-relaxed max-w-2xl">
              Institutional dropout probability decreased by <strong>3%</strong> since last semester — excellent progress.
              However, <strong>{departments?.find(d => d.risk === Math.max(...(departments ?? []).map(d => d.risk)))?.department ?? "Mechanical Engineering"}</strong> has reached a critical dropout risk and requires immediate attention.
              AI predicts graduation rate of <strong>{overview?.graduation_rate ?? 91}%</strong> this year.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: "View Risk Depts", href: "/dean/departments" },
                { label: "AI Intelligence", href: "/dean/ai-center" },
                { label: "Forecasting", href: "/dean/forecasting" },
                { label: "NAAC Status", href: "/dean/compliance" },
              ].map((a, i) => (
                <Link key={i} href={a.href}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg font-medium transition-colors border border-white/20">
                  {a.label} <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          </div>
          {/* Institution Health Score */}
          <div className="text-center bg-white/10 rounded-2xl p-5 border border-white/20 flex-shrink-0">
            <p className="text-xs text-violet-300 font-semibold mb-1">Institution Health Score</p>
            <p className="text-5xl font-black text-white">{healthScore}</p>
            <p className="text-xs text-violet-300 mt-1">/100 · <span className="text-emerald-300 font-semibold">{healthScore >= 85 ? "Good" : healthScore >= 70 ? "Fair" : "Needs Attention"}</span></p>
            <div className="mt-3 flex gap-1 justify-center">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={`w-5 h-2 rounded-full ${i < Math.round(healthScore / 10) ? "bg-violet-400" : "bg-zinc-600"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${colorMap[kpi.color]}`}>
              {kpi.icon}
            </div>
            <p className="text-xs text-zinc-400 font-medium">{kpi.label}</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{kpi.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-zinc-400">{kpi.sub}</p>
              <span className={`text-[10px] font-semibold ${kpi.trend.includes("↓") || kpi.trend.includes("critical") || kpi.trend.includes("Action") ? "text-amber-600" : "text-emerald-600"}`}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Zap size={15} className="text-red-500" /> Active AI Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeAlertsList.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              a.severity === "critical" ? "bg-red-50 border-red-200" :
              a.severity === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
            }`}>
              <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${
                a.severity === "critical" ? "text-red-500" : a.severity === "warning" ? "text-amber-500" : "text-blue-500"
              }`} />
              <div className="flex-1">
                <p className="text-xs font-bold text-zinc-900">{a.dept}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{a.issue}</p>
                <p className="text-[10px] text-zinc-400 mt-1">Recommended: {a.action}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                a.severity === "critical" ? "bg-red-200 text-red-700" : a.severity === "warning" ? "bg-amber-200 text-amber-700" : "bg-blue-200 text-blue-700"
              }`}>{a.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dropout Trend */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900">Dropout Rate Trend</h3>
            <span className="text-xs text-emerald-600 font-semibold">↓ Improving</span>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dropoutTrend ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <YAxis domain={[10, 22]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Dropout"]} />
                <Area type="monotone" dataKey="rate" stroke="#7c3aed" strokeWidth={2.5} fill="url(#dropGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Risk Comparison */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Department Dropout Risk</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Risk"]} />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]} barSize={22}>
                  {deptChartData.map((d, i) => (
                    <Cell key={i} fill={d.risk > 20 ? "#ef4444" : d.risk > 15 ? "#f59e0b" : "#7c3aed"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Student Risk Distribution</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {riskDist.map((r, i) => <Cell key={i} fill={r.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {riskDist.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.fill }} />
                {r.name}: <strong className="text-zinc-800">{r.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retention Trend */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900">Institutional Retention Trend</h3>
          <span className="text-xs text-emerald-600 font-semibold">↑ Improving across semesters</span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionTrend ?? []} margin={{ top: 5, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis domain={[80, 95]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Retention"]} />
              <Line type="monotone" dataKey="retention" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-zinc-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <Link key={i} href={a.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-violet-50 hover:border-violet-200 transition-all text-center group">
              <span className="text-xl">{a.icon}</span>
              <span className="text-[9px] font-semibold text-zinc-600 group-hover:text-violet-700 leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
