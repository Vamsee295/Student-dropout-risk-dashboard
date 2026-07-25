"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BrainCircuit, BarChart2, Bell, TrendingUp, FileText, ShieldCheck, Target, Cpu, Eye, Activity } from "lucide-react";

const features = [
  { icon: <BrainCircuit size={22} />, title: "AI Risk Prediction", desc: "XGBoost + SHAP ensemble model predicts individual student dropout probability weekly with 92.4% accuracy.", color: "violet", tag: "Core AI" },
  { icon: <BarChart2 size={22} />, title: "Learning Analytics", desc: "Deep dive into LMS engagement, assignment completion rates, session durations, and study patterns.", color: "indigo", tag: "Analytics" },
  { icon: <Bell size={22} />, title: "Early Warning System", desc: "Real-time alerts to faculty when students cross configurable risk thresholds. Zero manual monitoring required.", color: "red", tag: "Alerts" },
  { icon: <Target size={22} />, title: "Personalized Recommendations", desc: "AI generates weekly action plans for each student: schedule adjustments, resource suggestions, counselling triggers.", color: "emerald", tag: "Guidance" },
  { icon: <TrendingUp size={22} />, title: "Institutional Insights", desc: "Executive-level analytics for Dean/Admin: department trends, budget allocation intelligence, dropout forecasts.", color: "blue", tag: "Executive" },
  { icon: <FileText size={22} />, title: "Automated Reports", desc: "One-click generation of NAAC, department, faculty, and dropout reports in PDF, Excel, and PowerPoint formats.", color: "amber", tag: "Reports" },
  { icon: <ShieldCheck size={22} />, title: "Accreditation Ready", desc: "Built-in compliance dashboards for NAAC, NBA, AICTE, and UGC with KQI tracking and evidence export.", color: "teal", tag: "Compliance" },
  { icon: <Eye size={22} />, title: "Explainable AI", desc: "SHAP-based feature importance ensures faculty and students understand the 'why' behind every risk score.", color: "purple", tag: "XAI" },
  { icon: <Cpu size={22} />, title: "Role-Based Dashboards", desc: "Three completely isolated, role-specific workspaces: Student, Faculty, and Dean — each purpose-built.", color: "violet", tag: "UX" },
  { icon: <Activity size={22} />, title: "Real-Time Monitoring", desc: "Live attendance tracking, LMS integration, and continuous model inference with weekly risk recalculation.", color: "green", tag: "Live" },
  { icon: <BrainCircuit size={22} />, title: "AI Policy Simulator", desc: "\"What-If\" simulation engine: model outcomes of institutional policy changes before implementation.", color: "indigo", tag: "Strategy" },
  { icon: <BarChart2 size={22} />, title: "Heatmap Visualizations", desc: "Attendance and performance heatmaps across departments, semesters, and time periods for rapid pattern detection.", color: "orange", tag: "Visualization" },
];

const colorMap: Record<string, { bg: string; icon: string; tag: string }> = {
  violet: { bg: "bg-violet-50", icon: "text-violet-600", tag: "bg-violet-100 text-violet-700" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", tag: "bg-indigo-100 text-indigo-700" },
  red: { bg: "bg-red-50", icon: "text-red-600", tag: "bg-red-100 text-red-700" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", tag: "bg-emerald-100 text-emerald-700" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", tag: "bg-blue-100 text-blue-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", tag: "bg-amber-100 text-amber-700" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", tag: "bg-teal-100 text-teal-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", tag: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", icon: "text-green-600", tag: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", tag: "bg-orange-100 text-orange-700" },
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

export function CoreFeatures() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
              Core Features
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
              Everything You Need to Prevent Dropout
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              A complete enterprise platform with 12 purpose-built features — from AI prediction engines to accreditation dashboards.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const c = colorMap[f.color] || colorMap.violet;
            return (
              <FadeIn key={i} delay={(i % 6) * 0.07}>
                <div className="group p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:shadow-lg transition-all h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tag}`}>{f.tag}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
