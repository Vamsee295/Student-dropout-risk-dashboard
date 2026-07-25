"use client";

import { useState } from "react";
import { BrainCircuit, TrendingUp, Zap, Play } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const forecasts = [
  { semester: "Current (S5)", dropout: 12.4, retention: 87.6, enrollment: 720, placement: 84 },
  { semester: "S6 (Feb-May)", dropout: 10.8, retention: 89.2, enrollment: 740, placement: 86 },
  { semester: "S7 (Aug-Dec)", dropout: 9.5, retention: 90.5, enrollment: 755, placement: 87 },
  { semester: "S8 (Feb-May)", dropout: 8.8, retention: 91.2, enrollment: 768, placement: 89 },
];

const simulations = [
  {
    id: "attendance",
    label: "Attendance Improves by 5%",
    scenario: "If average attendance increases from 79.6% to 84.6% through stricter monitoring and counselling",
    beforeDropout: 12.4,
    afterDropout: 10.1,
    beforeRetention: 87.6,
    afterRetention: 89.9,
    confidence: 88,
  },
  {
    id: "mentoring",
    label: "Mentoring Program Doubles",
    scenario: "If peer mentoring coverage increases from 18% to 36% of at-risk students",
    beforeDropout: 12.4,
    afterDropout: 9.8,
    beforeRetention: 87.6,
    afterRetention: 90.2,
    confidence: 84,
  },
  {
    id: "assignments",
    label: "Assignment Completion Reaches 95%",
    scenario: "If average assignment submission rate increases from 74% to 95% through automated reminders",
    beforeDropout: 12.4,
    afterDropout: 11.2,
    beforeRetention: 87.6,
    afterRetention: 88.8,
    confidence: 79,
  },
];

const enrollmentForecast = [
  { year: "2022", actual: 680, predicted: 680 },
  { year: "2023", actual: 712, predicted: 715 },
  { year: "2024", actual: null, predicted: 740 },
  { year: "2025", actual: null, predicted: 762 },
  { year: "2026", actual: null, predicted: 785 },
];

export default function ForecastingPage() {
  const [simResult, setSimResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = (id: string) => {
    setIsSimulating(true);
    setTimeout(() => { setSimResult(id); setIsSimulating(false); }, 1200);
  };

  const selectedSim = simulations.find((s) => s.id === simResult);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Forecasting & Trends</h1>
        <p className="text-sm text-zinc-400 mt-0.5">AI-powered predictive analytics for strategic planning</p>
      </div>

      {/* Forecast Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-5 text-white">
        <p className="text-xs text-violet-300 font-semibold uppercase mb-2">AI Forecast — Next Semester (Feb–May 2024)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Predicted Dropout", value: "10.8%", dir: "down", sub: "↓ 1.6% improvement" },
            { label: "Predicted Retention", value: "89.2%", dir: "up", sub: "↑ 1.6% improvement" },
            { label: "Expected Enrollment", value: "740", dir: "up", sub: "↑ 20 new students" },
            { label: "Placement Forecast", value: "86%", dir: "up", sub: "↑ 2% improvement" },
          ].map((f, i) => (
            <div key={i} className="text-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <p className="text-2xl font-black">{f.value}</p>
              <p className="text-[10px] text-violet-200 font-medium mt-0.5">{f.label}</p>
              <p className={`text-[10px] mt-1 font-semibold ${f.dir === "down" ? "text-red-300" : "text-emerald-300"}`}>{f.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-zinc-900">Dropout Rate Forecast (4 Semesters)</h3>
          <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-2 py-1 rounded-lg">AI Confidence: 87%</span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecasts} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa" }} />
              <YAxis domain={[7, 14]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} formatter={(v) => [`${v}%`, "Dropout"]} />
              <Area type="monotone" dataKey="dropout" stroke="#7c3aed" strokeWidth={3} fill="url(#foreGrad)" strokeDasharray="4 0" dot={{ r: 5, fill: "#7c3aed" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment Forecast */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-5">Enrollment Forecast (2022–2026)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrollmentForecast} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis domain={[640, 810]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: "11px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="actual" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#a78bfa" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4 }} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Policy Simulator */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-violet-600" />
          <h3 className="font-bold text-zinc-900">What-If Policy Simulator</h3>
          <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 px-2 py-0.5 rounded-full ml-1">AI Simulation</span>
        </div>
        <p className="text-xs text-zinc-400 mb-5">Select a policy scenario to simulate its projected impact on institutional dropout and retention rates.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {simulations.map((s) => (
            <button key={s.id} onClick={() => runSimulation(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${simResult === s.id ? "border-violet-400 bg-violet-50" : "border-zinc-200 hover:border-violet-300 hover:bg-violet-50/40"}`}>
              <div className="flex items-start gap-3 mb-2">
                <Play size={14} className={simResult === s.id ? "text-violet-600 mt-0.5 flex-shrink-0" : "text-zinc-400 mt-0.5 flex-shrink-0"} />
                <p className={`text-xs font-bold ${simResult === s.id ? "text-violet-900" : "text-zinc-800"}`}>{s.label}</p>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">{s.scenario}</p>
            </button>
          ))}
        </div>

        {isSimulating && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-violet-900">Running AI Simulation...</p>
              <p className="text-xs text-violet-600">Processing 15,420 student records through EduRisk v2.3 model</p>
            </div>
          </div>
        )}

        {!isSimulating && selectedSim && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit size={16} className="text-violet-600" />
              <p className="font-bold text-violet-900">Simulation Result: "{selectedSim.label}"</p>
              <span className="ml-auto text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Confidence: {selectedSim.confidence}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Dropout Rate", before: `${selectedSim.beforeDropout}%`, after: `${selectedSim.afterDropout}%`, better: true },
                { label: "Retention Rate", before: `${selectedSim.beforeRetention}%`, after: `${selectedSim.afterRetention}%`, better: false },
              ].map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-violet-100">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">{r.label}</p>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm text-zinc-400 font-mono">{r.before}</p>
                      <p className="text-[9px] text-zinc-400">Before</p>
                    </div>
                    <TrendingUp size={16} className="text-violet-500" />
                    <div className="text-center">
                      <p className={`text-xl font-black ${r.better ? "text-emerald-600" : "text-violet-700"}`}>{r.after}</p>
                      <p className="text-[9px] text-zinc-400">Projected</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
