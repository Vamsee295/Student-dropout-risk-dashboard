"use client";

import { Brain, Clock, Flame, Activity, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell
} from "recharts";

const weeklyStudy = [
  { day: "Mon", hours: 3.5, lms: 4 }, { day: "Tue", hours: 5.0, lms: 6 },
  { day: "Wed", hours: 2.5, lms: 3 }, { day: "Thu", hours: 4.5, lms: 5 },
  { day: "Fri", hours: 6.0, lms: 7 }, { day: "Sat", hours: 3.0, lms: 4 },
  { day: "Sun", hours: 1.5, lms: 2 },
];

const heatmapData = [
  [3, 4, 2, 5, 6, 3, 1],
  [5, 6, 4, 7, 5, 4, 2],
  [2, 3, 1, 4, 3, 2, 0],
  [4, 5, 3, 6, 4, 5, 2],
];
const heatmapDays = ["M", "T", "W", "T", "F", "S", "S"];

const courseActivity = [
  { course: "DBMS", videos: 85, quizzes: 72, notes: 90 },
  { course: "OS", videos: 78, quizzes: 65, notes: 80 },
  { course: "ML", videos: 55, quizzes: 45, notes: 60 },
  { course: "Networks", videos: 70, quizzes: 60, notes: 65 },
  { course: "Math", videos: 60, quizzes: 50, notes: 55 },
];

const streak = 7;

export default function EngagementPage() {
  const totalHours = weeklyStudy.reduce((s, d) => s + d.hours, 0);
  const avgHours = (totalHours / 7).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Understand your learning habits and improve consistency</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Week", value: `${totalHours}h`, sub: "total study time", icon: <Clock size={20} />, color: "blue" },
          { label: "Daily Average", value: `${avgHours}h`, sub: "per day", icon: <TrendingUp size={20} />, color: "indigo" },
          { label: "Study Streak", value: `${streak} days`, sub: "🔥 Keep it up!", icon: <Flame size={20} />, color: "orange" },
          { label: "LMS Activity", value: "78%", sub: "engagement rate", icon: <Activity size={20} />, color: "emerald" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-50 text-blue-600" :
              s.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
              s.color === "orange" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Study Streak Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <h3 className="text-base font-bold text-orange-900">{streak}-Day Study Streak!</h3>
            </div>
            <p className="text-xs text-orange-600">You've been consistent this week. Keep going to hit your 10-day milestone!</p>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg text-[9px] font-bold flex items-center justify-center ${
                i < streak ? "bg-orange-400 text-white" : "bg-orange-100 text-orange-300"
              }`}>{i + 1}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Burnout Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Potential Burnout Signal Detected</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Your Wednesday study time dropped to 2.5h and LMS activity was minimal. Uneven study patterns can lead to burnout.
            Try the <strong>Pomodoro Technique</strong>: 25 min study + 5 min break × 4 sessions daily.
          </p>
        </div>
      </div>

      {/* Weekly Study Hours Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">Daily Study Hours (This Week)</h3>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /> Study Hours</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-400" /> LMS Sessions</span>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStudy} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={22} name="Study Hours" />
              <Bar dataKey="lms" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={22} name="LMS Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap + Course Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">Learning Heatmap (Last 4 Weeks)</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {heatmapDays.map((d, i) => (
                <p key={i} className="text-[10px] text-slate-400 font-medium text-center">{d}</p>
              ))}
            </div>
            {heatmapData.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5">
                {week.map((val, di) => (
                  <div key={di} className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    val === 0 ? "bg-slate-100 text-slate-300" :
                    val <= 2 ? "bg-blue-100 text-blue-500" :
                    val <= 4 ? "bg-blue-300 text-blue-800" :
                    val <= 6 ? "bg-blue-500 text-white" : "bg-blue-700 text-white"
                  }`}>{val}h</div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
            {["0h", "1-2h", "3-4h", "5-6h", "7h+"].map((l, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`w-4 h-4 rounded ${["bg-slate-100", "bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700"][i]}`} />
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Course LMS Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">Course LMS Activity</h3>
          <div className="space-y-4">
            {courseActivity.map((c, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-slate-700 mb-1.5">{c.course}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Videos", value: c.videos },
                    { label: "Quizzes", value: c.quizzes },
                    { label: "Notes", value: c.notes },
                  ].map((m, j) => (
                    <div key={j}>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{m.label}</span><span>{m.value}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Study Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-blue-600" />
          <h3 className="font-bold text-blue-900">AI Study Pattern Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: "⚡", title: "Best Study Time", text: "Your focus peaks between 10 AM–12 PM. Schedule tough subjects during this window." },
            { icon: "📉", title: "Weak Pattern", text: "Wednesday and Sunday activity is consistently low. Schedule light review sessions on these days." },
            { icon: "🎯", title: "Goal for Next Week", text: "Aim for 5+ hours/day Mon–Fri and increase ML course video completion above 70%." },
          ].map((insight, i) => (
            <div key={i} className="bg-white rounded-xl border border-blue-100 p-4">
              <p className="text-xl mb-2">{insight.icon}</p>
              <p className="text-xs font-bold text-slate-800 mb-1">{insight.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
