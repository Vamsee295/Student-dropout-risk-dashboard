"use client";

import { TrendingUp } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";

import { useDeanAnalytics } from "@/hooks/useDeanAnalytics";

export default function AnalyticsPage() {
  const { multiTrend, yearlyGraduation, researchGrowth, leaderboards, isLoading } = useDeanAnalytics();

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Institutional Analytics</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Enterprise-level multi-dimensional performance intelligence</p>
      </div>

      {/* Multi-axis Trend */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900">Multi-Axis Institutional Trend</h3>
          <div className="flex gap-3 flex-wrap">
            {[["#ef4444", "Dropout %"], ["#10b981", "Retention %"], ["#7c3aed", "Attendance %"], ["#f59e0b", "Placement %"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-zinc-400">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: c }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiTrend} margin={{ top: 5, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
              <Line type="monotone" dataKey="dropout" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Dropout %" />
              <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Retention %" />
              <Line type="monotone" dataKey="attendance" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} name="Attendance %" />
              <Line type="monotone" dataKey="placement" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Placement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graduation + Research */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-5">Graduation Rate — 6 Year Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyGraduation} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis domain={[78, 95]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Graduation"]} />
                <Area type="monotone" dataKey="rate" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gradGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-5">Research Output Growth</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={researchGrowth} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="papers" name="Research Papers" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="grants" name="Research Grants" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dept Composite Leaderboard */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-600" /> Department Composite Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboards.departments.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                  i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-zinc-200 text-zinc-700" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-zinc-50 text-zinc-500"
                }`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : d.rank}</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-800">{d.name}</p>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
                <span className="text-sm font-black text-violet-600 w-10 text-right">{d.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Leaderboard */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600" /> Top Placement Departments
          </h3>
          <div className="space-y-3">
            {leaderboards.placement.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-800">{d.name}</p>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-600">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
