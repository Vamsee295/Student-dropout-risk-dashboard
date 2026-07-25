"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Clock, TrendingDown, Heart, DollarSign, BookX, ArrowRight, Lightbulb } from "lucide-react";

const problems = [
  { icon: <TrendingDown size={20} className="text-red-500" />, title: "Poor Academic Performance", desc: "Students falling behind in key subjects with no early alert system to detect the slide.", bg: "bg-red-50", border: "border-red-100" },
  { icon: <Clock size={20} className="text-amber-500" />, title: "Low Attendance & Engagement", desc: "Below-threshold attendance with zero automated monitoring or faculty notification.", bg: "bg-amber-50", border: "border-amber-100" },
  { icon: <DollarSign size={20} className="text-orange-500" />, title: "Financial Pressures", desc: "Students unable to continue due to financial strain with no institutional support flag.", bg: "bg-orange-50", border: "border-orange-100" },
  { icon: <Heart size={20} className="text-pink-500" />, title: "Mental Health Issues", desc: "No mechanism to detect early signs of burnout, stress, or disengagement.", bg: "bg-pink-50", border: "border-pink-100" },
  { icon: <BookX size={20} className="text-violet-500" />, title: "No Early Intervention", desc: "Faculty and advisors lack real-time data to intervene before students drop out.", bg: "bg-violet-50", border: "border-violet-100" },
  { icon: <AlertTriangle size={20} className="text-slate-500" />, title: "Institutional Blindspots", desc: "Deans and administrators lack aggregated, predictive institutional intelligence.", bg: "bg-slate-50", border: "border-slate-100" },
];

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ProblemSolution() {
  return (
    <>
      {/* Problem */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <FadeInSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full mb-4">
                The Problem
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
                Why Students Drop Out
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
                Educational institutions lose thousands of students annually — not due to a lack of talent, but due to a lack of visibility and timely intervention.
              </p>
            </div>
          </FadeInSection>

          {/* Stat bar */}
          <FadeInSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
              {[
                { value: "18%", label: "Average National Dropout Rate", color: "text-red-600", bg: "bg-red-50 border-red-200" },
                { value: "45%", label: "Students Disengaged from LMS", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                { value: "72%", label: "Cases With No Early Warning", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border ${s.bg}`}>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-sm font-semibold text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p, i) => (
              <FadeInSection key={i} delay={i * 0.07}>
                <div className={`p-5 rounded-2xl border ${p.bg} ${p.border} h-full`}>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                    {p.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
                  Our Solution
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-5">
                  How EduRisk AI <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                    Solves It
                  </span>
                </h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  EduRisk AI is an end-to-end predictive analytics platform that ingests multi-dimensional student data, runs it through an explainable machine learning model, and delivers role-based intelligence to students, faculty, and administrators — creating a complete feedback loop of early intervention.
                </p>
                <div className="space-y-3">
                  {[
                    "Identifies at-risk students 4–6 weeks before critical failure",
                    "Provides explainable AI so faculty understand why a student is at risk",
                    "Delivers personalized action plans directly to students",
                    "Gives administrators institution-wide strategic intelligence",
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ArrowRight size={10} className="text-white" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🤖", title: "AI Prediction", desc: "92.4% accurate dropout risk scoring using Gradient Boosted Trees + SHAP analysis" },
                  { icon: "⚡", title: "Early Warning", desc: "Automated alerts to faculty and advisors when students cross risk thresholds" },
                  { icon: "📊", title: "Analytics Dashboards", desc: "Role-specific dashboards for Students, Faculty, and Dean/Admin" },
                  { icon: "🎯", title: "Personalized Guidance", desc: "AI-generated action plans tailored to each student's unique risk profile" },
                  { icon: "📈", title: "Institutional Insights", desc: "Department-level forecasts, trends, and budget-optimized recommendations" },
                  { icon: "🔍", title: "Explainable AI", desc: "SHAP values reveal exactly which factors drive each student's risk score" },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                    <span className="text-2xl">{s.icon}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2 mb-1">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
    </>
  );
}
