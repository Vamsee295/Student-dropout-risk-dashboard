"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BrainCircuit,
  TrendingDown,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const floatingCards = [
  { icon: <TrendingDown size={14} className="text-red-500" />, label: "Dropout Risk", value: "12.4%", delta: "↓ 3.2%", good: true, color: "red" },
  { icon: <Users size={14} className="text-violet-500" />, label: "At-Risk Students", value: "306", delta: "Immediate attention", good: false, color: "violet" },
  { icon: <BrainCircuit size={14} className="text-cyan-500" />, label: "AI Accuracy", value: "92.4%", delta: "↑ 4.1% this month", good: true, color: "cyan" },
  { icon: <ShieldAlert size={14} className="text-amber-500" />, label: "Interventions", value: "48", delta: "Active this week", good: true, color: "amber" },
];

import type { Variants } from "framer-motion";

const badge: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const headline: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function HeroSection() {
  const words = "AI-Powered Student Success Platform".split(" ");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-cyan-50 to-cyan-100/50 pt-20">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
        {/* Left — Copy */}
        <div>
          <motion.div
            variants={badge}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-cyan-700 mb-6 shadow-sm"
          >
            <Sparkles size={11} className="text-cyan-600" />
            Powered by Explainable AI &amp; Machine Learning
          </motion.div>

          <motion.h1
            variants={headline}
            initial="hidden"
            animate="visible"
            className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6"
          >
            {words.map((w, i) => (
              <motion.span key={i} variants={word} className="inline-block mr-3">
                {w === "AI-Powered" ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500">
                    {w}
                  </span>
                ) : (
                  w
                )}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-base text-slate-600 leading-relaxed mb-8 max-w-lg"
          >
            EduRisk AI predicts student dropout risks <strong className="text-slate-900">before they happen</strong>.
            Our machine learning engine continuously monitors attendance, engagement, and academic performance
            to deliver early warnings, personalized interventions, and executive analytics for your institution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/40"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-wrap gap-6 mt-10"
          >
            {[
              { value: "95%", label: "AI Accuracy" },
              { value: "25K+", label: "Students Tracked" },
              { value: "500K+", label: "Predictions Made" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Floating cards dashboard preview */}
        <div className="relative hidden lg:flex items-center justify-center h-[520px]">
          {/* Central card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-10 bg-white border border-slate-200 rounded-2xl p-5 w-72 shadow-2xl shadow-slate-200/50"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <BrainCircuit size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">EduRisk AI Engine</p>
                <p className="text-[10px] text-slate-500">Real-time Analysis</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Attendance Score", pct: 79, color: "amber" },
                { label: "Engagement Index", pct: 64, color: "red" },
                { label: "Academic Performance", pct: 86, color: "cyan" },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-1 font-medium">
                    <span>{m.label}</span>
                    <span className="font-bold text-slate-900">{m.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        m.color === "amber" ? "bg-amber-400" :
                        m.color === "red" ? "bg-red-400" : "bg-cyan-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[10px] font-bold text-red-600">⚠ High Dropout Risk Detected</p>
              <p className="text-[10px] text-red-400 mt-0.5">Immediate faculty intervention recommended</p>
            </div>
          </motion.div>

          {/* Floating stat cards */}
          {floatingCards.map((c, i) => {
            const positions = [
              "absolute -top-4 -left-8",
              "absolute top-4 -right-12",
              "absolute -bottom-8 -left-4",
              "absolute -bottom-4 -right-6",
            ];
            return (
              <motion.div
                key={i}
                className={`${positions[i]} bg-white border border-slate-200 rounded-xl p-3 shadow-xl shadow-slate-200/50 w-40`}
                initial={{ opacity: 0, y: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {c.icon}
                  <p className="text-[10px] text-slate-500 font-medium">{c.label}</p>
                </div>
                <p className="text-lg font-black text-slate-900">{c.value}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${c.good ? "text-emerald-500" : "text-amber-500"}`}>{c.delta}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom wave (matches next section background) */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
