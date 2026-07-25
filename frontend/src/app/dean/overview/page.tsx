"use client";

import { Building, GraduationCap, Users, BookOpen, Award, Globe, TrendingUp, CheckCircle2 } from "lucide-react";

const infrastructure = [
  { name: "Lecture Halls", total: 48, inUse: 41, pct: 85 },
  { name: "Laboratories", total: 32, inUse: 28, pct: 88 },
  { name: "Library Seats", total: 800, inUse: 610, pct: 76 },
  { name: "Hostel Rooms", total: 1200, inUse: 1054, pct: 88 },
  { name: "Sports Facilities", total: 12, inUse: 9, pct: 75 },
];

const programs = [
  { name: "B.Tech (CSE)", students: 480, seats: 480, type: "UG" },
  { name: "B.Tech (ECE)", students: 360, seats: 360, type: "UG" },
  { name: "B.Tech (EEE)", students: 240, seats: 240, type: "UG" },
  { name: "B.Tech (Civil)", students: 200, seats: 240, type: "UG" },
  { name: "B.Tech (Mech)", students: 320, seats: 360, type: "UG" },
  { name: "MBA (General)", students: 180, seats: 180, type: "PG" },
  { name: "B.Tech (AI & DS)", students: 240, seats: 240, type: "UG" },
  { name: "M.Tech (CSE)", students: 60, seats: 60, type: "PG" },
];

const achievements = [
  { label: "NAAC Grade", value: "A", sub: "Accredited 2022", icon: "🏅" },
  { label: "NIRF Rank", value: "#94", sub: "Engineering Category", icon: "🏆" },
  { label: "NBA Accredited", value: "4/7", sub: "Departments", icon: "✅" },
  { label: "Research Papers", value: "412", sub: "Published in 2023", icon: "📄" },
];

export default function OverviewPage() {
  const healthScore = 87;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Institution Overview</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Global Polytechnic University · Academic Year 2023–24</p>
      </div>

      {/* Health Score Banner */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs text-violet-300 font-semibold uppercase mb-1">Institution Health Score</p>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-6xl font-black">{healthScore}</span>
              <span className="text-2xl text-violet-300 font-bold mb-2">/100</span>
            </div>
            <span className="text-sm font-bold text-emerald-300">🟢 Good — Above National Average</span>
            <p className="text-violet-200 text-xs mt-2 max-w-lg">
              Overall health improved by 4 points since last semester driven by improved placement rates (+6%), reduced dropout (-3%), and higher student satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Accreditation", value: "NAAC A" },
              { label: "Established", value: "1997" },
              { label: "Campus Area", value: "120 Acres" },
              { label: "Location", value: "Chennai, TN" },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                <p className="text-sm font-bold">{s.value}</p>
                <p className="text-[10px] text-violet-300 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "2,847", icon: <Users size={20} />, color: "violet", sub: "7 Departments" },
          { label: "Total Faculty", value: "142", icon: <GraduationCap size={20} />, color: "indigo", sub: "88 Full-time, 54 Visiting" },
          { label: "Programs Offered", value: "12", icon: <BookOpen size={20} />, color: "blue", sub: "UG + PG + Research" },
          { label: "Placement Rate", value: "84%", icon: <TrendingUp size={20} />, color: "emerald", sub: "602 offers · 2023 batch" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "violet" ? "bg-violet-50 text-violet-600" : s.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
              s.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
            }`}>{s.icon}</div>
            <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{s.value}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((a, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-center">
            <span className="text-3xl">{a.icon}</span>
            <p className="text-xl font-black text-violet-700 mt-2">{a.value}</p>
            <p className="text-xs font-bold text-zinc-800 mt-0.5">{a.label}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{a.sub}</p>
          </div>
        ))}
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900">Academic Programs & Enrollment</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase">Program</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-zinc-400 uppercase">Type</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-zinc-400 uppercase">Enrolled</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-zinc-400 uppercase">Intake</th>
                <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase">Fill Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {programs.map((p, i) => {
                const fillPct = Math.round((p.students / p.seats) * 100);
                return (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{p.name}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.type === "UG" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
                      }`}>{p.type}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-zinc-900">{p.students}</td>
                    <td className="px-3 py-3 text-center text-sm text-zinc-500">{p.seats}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden max-w-[100px]">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-600">{fillPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Utilization */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Infrastructure Utilization</h3>
        <div className="space-y-4">
          {infrastructure.map((inf, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-zinc-700">{inf.name}</span>
                <div className="flex gap-3 text-zinc-400">
                  <span>{inf.inUse}/{inf.total} in use</span>
                  <span className={`font-bold ${inf.pct >= 85 ? "text-amber-600" : "text-violet-600"}`}>{inf.pct}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${inf.pct}%`,
                  backgroundColor: inf.pct >= 90 ? "#ef4444" : inf.pct >= 80 ? "#f59e0b" : "#7c3aed"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
