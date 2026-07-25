"use client";

import { Wallet, TrendingUp, AlertTriangle, BrainCircuit, PieChart as PieIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const deptBudgets = [
  { dept: "CSE", allocated: 42, spent: 36, pct: 86, color: "#7c3aed" },
  { dept: "ECE", allocated: 35, spent: 27, pct: 77, color: "#6366f1" },
  { dept: "EEE", allocated: 28, spent: 22, pct: 79, color: "#3b82f6" },
  { dept: "Civil", allocated: 24, spent: 22, pct: 92, color: "#f59e0b" },
  { dept: "Mech", allocated: 30, spent: 28, pct: 93, color: "#ef4444" },
  { dept: "MBA", allocated: 20, spent: 16, pct: 80, color: "#10b981" },
  { dept: "AI&DS", allocated: 38, spent: 28, pct: 74, color: "#a78bfa" },
];

const budgetCategories = [
  { name: "Faculty Salaries", value: 42, fill: "#7c3aed" },
  { name: "Infrastructure", value: 18, fill: "#6366f1" },
  { name: "Research Grants", value: 14, fill: "#3b82f6" },
  { name: "Scholarships", value: 12, fill: "#10b981" },
  { name: "Laboratories", value: 8, fill: "#f59e0b" },
  { name: "Admin & Operations", value: 6, fill: "#64748b" },
];

const aiSuggestions = [
  { priority: "High", suggestion: "Increase Mechanical Engineering lab budget by ₹8L — equipment outdated (avg 7 years old)", dept: "Mech", impact: "↓3% dropout expected" },
  { priority: "High", suggestion: "Recruit 2 additional faculty for Mechanical Engineering (current ratio 1:27, target 1:20)", dept: "Mech", impact: "↑Teaching quality" },
  { priority: "Medium", suggestion: "Expand AI & DS lab capacity — demand growing 40% annually, current utilization 91%", dept: "AI&DS", impact: "↑Enrollment capacity" },
  { priority: "Medium", suggestion: "Increase Civil Engineering remedial support budget by ₹3L for tutoring program", dept: "Civil", impact: "↓Dropout by ~2%" },
  { priority: "Low", suggestion: "Upgrade Library digital resources subscription — current expiry in 60 days", dept: "All", impact: "Research support" },
];

export default function BudgetPage() {
  const totalAllocated = deptBudgets.reduce((sum, d) => sum + d.allocated, 0);
  const totalSpent = deptBudgets.reduce((sum, d) => sum + d.spent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Budget & Resource Management</h1>
        <p className="text-sm text-zinc-400 mt-0.5">FY 2023–24 · Institutional Financial Intelligence</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Budget (FY)", value: "₹2.17Cr", sub: "Annual allocation", color: "violet" },
          { label: "Total Spent", value: `₹${(totalSpent / 10).toFixed(1)}L`, sub: `${Math.round((totalSpent / totalAllocated) * 100)}% utilized`, color: "amber" },
          { label: "Remaining", value: `₹${((totalAllocated - totalSpent) / 10).toFixed(1)}L`, sub: "Available balance", color: "emerald" },
          { label: "Over-utilized Depts", value: "2", sub: "Civil & Mechanical >90%", color: "red" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-xs text-zinc-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${
              s.color === "violet" ? "text-violet-600" : s.color === "amber" ? "text-amber-600" :
              s.color === "emerald" ? "text-emerald-600" : "text-red-600"
            }`}>{s.value}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Dept Budget bars + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-5">Department Budget Allocation vs. Utilization (₹L)</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBudgets} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`₹${v}L`, ""]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="allocated" name="Allocated" fill="#e0e7ff" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="spent" name="Spent" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-4">Budget by Category</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetCategories} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                  {budgetCategories.map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {budgetCategories.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.fill }} />
                <span className="text-zinc-500 flex-1">{c.name}</span>
                <span className="font-bold text-zinc-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept utilization list */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Utilization Rate by Department</h3>
        <div className="space-y-4">
          {deptBudgets.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-zinc-700">{d.dept} — ₹{d.spent}L / ₹{d.allocated}L</span>
                <span className={`font-bold ${d.pct >= 90 ? "text-red-600" : d.pct >= 80 ? "text-amber-600" : "text-violet-600"}`}>{d.pct}%</span>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Budget Suggestions */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <BrainCircuit size={16} className="text-violet-600" />
          <h3 className="font-bold text-zinc-900">AI Budget Recommendations</h3>
        </div>
        <div className="space-y-3">
          {aiSuggestions.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
              s.priority === "High" ? "bg-red-50 border-red-200" : s.priority === "Medium" ? "bg-amber-50 border-amber-200" : "bg-zinc-50 border-zinc-200"
            }`}>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex-shrink-0 mt-0.5 ${
                s.priority === "High" ? "bg-red-200 text-red-700" : s.priority === "Medium" ? "bg-amber-200 text-amber-700" : "bg-zinc-200 text-zinc-600"
              }`}>{s.priority}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-zinc-800">{s.suggestion}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-zinc-400">Dept: {s.dept}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><TrendingUp size={9} /> {s.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
