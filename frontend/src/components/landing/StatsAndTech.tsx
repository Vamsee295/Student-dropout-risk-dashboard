"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 25000, suffix: "+", label: "Students Tracked", icon: "🎓" },
  { value: 500000, suffix: "+", label: "AI Predictions Made", icon: "🤖" },
  { value: 95, suffix: "%", label: "Model Accuracy", icon: "🎯" },
  { value: 25, suffix: "", label: "Departments Served", icon: "🏛" },
  { value: 500, suffix: "+", label: "Faculty Users", icon: "🧑‍🏫" },
  { value: 50000, suffix: "+", label: "Reports Generated", icon: "📄" },
];

const techStack = [
  { category: "Frontend", items: [
    { name: "Next.js", icon: "▲", color: "bg-black text-white" },
    { name: "React", icon: "⚛", color: "bg-blue-100 text-blue-700" },
    { name: "TypeScript", icon: "TS", color: "bg-blue-600 text-white" },
    { name: "Tailwind CSS", icon: "🎨", color: "bg-teal-100 text-teal-700" },
  ]},
  { category: "Backend", items: [
    { name: "FastAPI", icon: "⚡", color: "bg-emerald-100 text-emerald-700" },
    { name: "Python", icon: "🐍", color: "bg-yellow-100 text-yellow-700" },
    { name: "REST API", icon: "🔗", color: "bg-indigo-100 text-indigo-700" },
    { name: "JWT Auth", icon: "🔐", color: "bg-slate-100 text-slate-700" },
  ]},
  { category: "AI / ML", items: [
    { name: "XGBoost", icon: "🌲", color: "bg-orange-100 text-orange-700" },
    { name: "Scikit-Learn", icon: "🔬", color: "bg-amber-100 text-amber-700" },
    { name: "Pandas", icon: "🐼", color: "bg-blue-100 text-blue-700" },
    { name: "SHAP", icon: "📊", color: "bg-violet-100 text-violet-700" },
  ]},
  { category: "Data & Cloud", items: [
    { name: "MongoDB", icon: "🍃", color: "bg-emerald-100 text-emerald-700" },
    { name: "PostgreSQL", icon: "🐘", color: "bg-blue-100 text-blue-700" },
    { name: "Vercel", icon: "▲", color: "bg-slate-100 text-slate-700" },
    { name: "Docker", icon: "🐳", color: "bg-sky-100 text-sky-700" },
  ]},
  { category: "Visualisation", items: [
    { name: "Recharts", icon: "📈", color: "bg-violet-100 text-violet-700" },
    { name: "Framer Motion", icon: "🎞", color: "bg-pink-100 text-pink-700" },
    { name: "Lucide Icons", icon: "✦", color: "bg-slate-100 text-slate-700" },
    { name: "Tailwind Animate", icon: "✨", color: "bg-teal-100 text-teal-700" },
  ]},
];

function AnimatedCounter({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1800;
      const step = target / (duration / 16);
      const interval = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(interval); }
        else setCount(Math.floor(start));
      }, 16);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, target, delay]);

  return (
    <span ref={ref}>
      {count >= 1000 ? (count >= 100000 ? `${(count / 1000).toFixed(0)}K` : count >= 1000 ? `${(count / 1000).toFixed(1)}K`.replace(".0K", "K") : count) : count}
      {suffix}
    </span>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

export function StatsAndTech() {
  return (
    <>
      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">Platform at a Glance</h2>
              <p className="text-cyan-100 text-sm font-medium">Real numbers from an enterprise-scale deployment</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 hover:shadow-lg transition-all">
                  <span className="text-3xl mb-2 block">{s.icon}</span>
                  <p className="text-2xl font-black">
                    <AnimatedCounter target={s.value} suffix={s.suffix} delay={i * 0.1} />
                  </p>
                  <p className="text-[10px] text-cyan-50 font-medium mt-1">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="technology" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
                Technology Stack
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
                Enterprise-Grade Technology
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-base">
                Built with production-ready tools trusted by the world's leading engineering teams.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {techStack.map((cat, ci) => (
              <FadeIn key={ci} delay={ci * 0.08}>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{cat.category}</h3>
                  <div className="flex flex-wrap gap-3">
                    {cat.items.map((item, ii) => (
                      <div key={ii} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 hover:shadow-md transition-all ${item.color}`}>
                        <span className="text-sm font-bold">{item.icon}</span>
                        <span className="text-sm font-bold">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
