"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";

const dashboards = [
  {
    id: "student",
    label: "🎓 Student",
    title: "Personal Academic Command Center",
    subtitle: "Your personalized AI-powered academic success assistant",
    color: "blue",
    description: "The Student Dashboard is not just a grade viewer — it is an AI-powered success coach that continuously monitors your academic journey, predicts risks, and delivers personalized weekly action plans.",
    features: [
      "Real-time dropout risk score with personalized breakdown",
      "Subject-wise performance analytics and trend charts",
      "Attendance tracking with smart alerts",
      "AI-generated weekly study plans",
      "Career readiness and skill gap analysis",
      "Assignment tracker with deadline intelligence",
    ],
    preview: {
      title: "AI Risk Score",
      score: "34",
      level: "Low Risk",
      levelColor: "text-emerald-400",
      metrics: [
        { label: "Attendance", val: 84, color: "bg-blue-400" },
        { label: "Performance", val: 78, color: "bg-violet-400" },
        { label: "Engagement", val: 91, color: "bg-emerald-400" },
      ],
    },
  },
  {
    id: "faculty",
    label: "🧑‍🏫 Faculty",
    title: "Student Monitoring Workspace",
    subtitle: "Your operational center for managing and supporting students",
    color: "emerald",
    description: "Faculty get a full 360° operational workspace to monitor all assigned students, conduct interventions, track attendance, manage assessments, and receive AI-driven alerts — reducing manual effort by over 60%.",
    features: [
      "At-risk student roster with risk severity ranking",
      "Course-level analytics and dropout trend charts",
      "One-click intervention logging and tracking",
      "Attendance management with deviation alerts",
      "AI recommendations for each at-risk student",
      "Faculty performance and workload analytics",
    ],
    preview: {
      title: "At-Risk Students",
      score: "12",
      level: "Need Intervention",
      levelColor: "text-amber-400",
      metrics: [
        { label: "High Risk", val: 12, color: "bg-red-400" },
        { label: "Moderate", val: 28, color: "bg-amber-400" },
        { label: "Low Risk", val: 60, color: "bg-emerald-400" },
      ],
    },
  },
  {
    id: "dean",
    label: "👑 Dean / Admin",
    title: "Executive Decision Support System",
    subtitle: "Institutional-level strategic intelligence and governance",
    color: "violet",
    description: "The Dean Dashboard is an Executive Command Center — giving Deans, Principals, and Registrars a real-time digital twin of the institution with AI-powered forecasts, compliance tracking, and budget intelligence.",
    features: [
      "Institution Health Score (0–100) with trend analysis",
      "Department-level comparison and risk benchmarking",
      "AI forecasting for next-semester dropout prediction",
      "\"What-If\" policy simulator for strategic decisions",
      "NAAC / NBA / AICTE compliance monitoring",
      "Budget allocation intelligence and optimization",
    ],
    preview: {
      title: "Institution Health",
      score: "87",
      level: "Good · Above Average",
      levelColor: "text-emerald-400",
      metrics: [
        { label: "Retention", val: 88, color: "bg-emerald-400" },
        { label: "Placement", val: 84, color: "bg-violet-400" },
        { label: "Accreditation", val: 81, color: "bg-indigo-400" },
      ],
    },
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

const routeMap: Record<string, string> = { student: "/student/dashboard", faculty: "/faculty/dashboard", dean: "/dean/dashboard" };

export function DashboardShowcase() {
  const [active, setActive] = useState("student");
  const d = dashboards.find((d) => d.id === active)!;

  const borderColor = d.color === "blue" ? "border-blue-200" : d.color === "emerald" ? "border-emerald-200" : "border-violet-200";
  const bgColor = d.color === "blue" ? "bg-blue-50" : d.color === "emerald" ? "bg-emerald-50" : "bg-violet-50";
  const textColor = d.color === "blue" ? "text-blue-600" : d.color === "emerald" ? "text-emerald-600" : "text-violet-600";
  const activeTab = d.color === "blue" ? "bg-blue-600" : d.color === "emerald" ? "bg-emerald-600" : "bg-violet-600";

  return (
    <section id="dashboards" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-5">
        <FadeIn>
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
              Dashboard Showcase
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              Three Dashboards. One Platform.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              Each role gets a purpose-built workspace — not a reskinned version of the same thing. Explore all three.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Tab selector */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
              {dashboards.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActive(d.id)}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    active === d.id
                      ? `${activeTab} text-white shadow-sm`
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            {/* Left — Description */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{d.title}</h3>
              <p className={`text-sm font-semibold ${textColor} mb-4`}>{d.subtitle}</p>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{d.description}</p>
              <ul className="space-y-2.5 mb-8">
                {d.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className={`w-5 h-5 rounded-full ${activeTab} flex items-center justify-center flex-shrink-0`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={routeMap[active]}
                className={`inline-flex items-center gap-2 px-5 py-2.5 ${activeTab} text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-sm`}
              >
                Open {d.label.split(" ")[1]} Dashboard →
              </Link>
            </div>

            {/* Right — Preview card */}
            <div className={`${bgColor} border ${borderColor} rounded-2xl p-6 shadow-sm`}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{d.preview.title}</p>
                    <div className="flex items-end gap-2 mt-1">
                      <p className="text-4xl font-black text-slate-900">{d.preview.score}</p>
                      {d.id === "dean" && <p className="text-slate-400 text-lg font-semibold mb-1">/100</p>}
                    </div>
                    <p className={`text-xs font-bold ${d.preview.levelColor} mt-0.5`}>● {d.preview.level}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {d.preview.metrics.map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">{m.label}</span>
                        <span className="text-slate-700 font-bold">{m.val}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${m.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${m.val}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "AI Insights", icon: "🤖" },
                  { label: "Alerts", icon: "🔔" },
                  { label: "Reports", icon: "📄" },
                ].map((q, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
                    <span className="text-xl">{q.icon}</span>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">{q.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
