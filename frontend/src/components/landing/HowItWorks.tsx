"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  { step: "01", icon: "🗂️", title: "Student Data Collection", desc: "Attendance records, LMS activity, internal exam marks, assignment submissions, and engagement logs are collected in real time.", color: "violet" },
  { step: "02", icon: "🔧", title: "Data Processing & Cleaning", desc: "Raw data is normalized, missing values are handled, and feature engineering is applied to prepare a high-quality training dataset.", color: "indigo" },
  { step: "03", icon: "🤖", title: "Machine Learning Engine", desc: "A Gradient Boosted ensemble model (XGBoost) is trained on 7 semesters of historical data from 15,000+ student records.", color: "blue" },
  { step: "04", icon: "🎯", title: "Risk Score Prediction", desc: "Each student receives a dropout risk score (0–100) updated weekly, with SHAP-based explainability showing key contributing factors.", color: "violet" },
  { step: "05", icon: "💡", title: "AI Recommendations", desc: "Based on the risk profile, personalized action plans are generated: study plans, counselling referrals, mentor assignments.", color: "indigo" },
  { step: "06", icon: "🧑‍🏫", title: "Faculty Intervention", desc: "Faculty receive automatic alerts for their high-risk students with context, enabling targeted and timely support.", color: "blue" },
  { step: "07", icon: "🎓", title: "Student Success", desc: "With continuous monitoring and interventions, students improve their performance, engagement, and graduation probability.", color: "emerald" },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

const colorMap = {
  violet: { bg: "bg-violet-50", border: "border-violet-200", num: "bg-violet-600", dot: "bg-violet-500", line: "bg-violet-200" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", num: "bg-indigo-600", dot: "bg-indigo-500", line: "bg-indigo-200" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", num: "bg-blue-600", dot: "bg-blue-500", line: "bg-blue-200" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", num: "bg-emerald-600", dot: "bg-emerald-500", line: "bg-emerald-200" },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-5">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              From Raw Data to Student Success
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              Our 7-step intelligent pipeline transforms multi-source student data into actionable dropout prevention strategies.
            </p>
          </div>
        </FadeIn>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-indigo-200 to-emerald-200 hidden md:block ml-[calc(50%-1px)]" />

          <div className="space-y-8">
            {steps.map((s, i) => {
              const c = colorMap[s.color as keyof typeof colorMap];
              const isRight = i % 2 !== 0;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className={`relative flex items-center gap-8 ${isRight ? "flex-row-reverse" : ""}`}>
                    {/* Card */}
                    <div className="flex-1">
                      <div className={`${c.bg} border ${c.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{s.icon}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black text-white px-1.5 py-0.5 rounded-md ${c.num}`}>STEP {s.step}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">{s.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className={`hidden md:flex w-4 h-4 rounded-full ${c.dot} border-2 border-white shadow-md flex-shrink-0 z-10`} />

                    {/* Spacer for opposite side */}
                    <div className="flex-1 hidden md:block" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
