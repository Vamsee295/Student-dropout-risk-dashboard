"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Github, Mail, Linkedin } from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

export function CTAAndFooter() {
  return (
    <>
      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-cyan-50 via-white to-cyan-100/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
          <FadeIn>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-200">
              <BrainCircuit size={28} className="text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-5 leading-tight">
              Ready to Transform<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                Student Success?
              </span>
            </h2>
            <p className="text-slate-600 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Join institutions that are already using AI-powered analytics to predict dropout risks, support at-risk students, and improve graduation rates — before problems escalate.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white font-black rounded-xl text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/30"
              >
                Get Started Now <ArrowRight size={15} />
              </Link>
              <a
                href="#dashboards"
                className="flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm"
              >
                Explore Dashboards
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { label: "Students", href: "/login" },
                { label: "Faculty", href: "/login" },
                { label: "Dean / Admin", href: "/login" },
              ].map((r) => (
                <Link key={r.label} href={r.href} className="text-sm text-cyan-600 font-medium hover:text-cyan-800 underline underline-offset-4 transition-colors">
                  Login as {r.label} →
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-200">
                  <BrainCircuit size={16} className="text-white" />
                </div>
                <span className="text-sm font-black text-slate-900">EduRisk <span className="text-cyan-600">AI</span></span>
              </div>
              <p className="text-xs leading-relaxed mb-4">
                AI-powered student dropout risk prediction for educational institutions. Predicting futures. Changing lives.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600">
                  <Github size={14} />
                </a>
                <a href="https://linkedin.com" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600">
                  <Linkedin size={14} />
                </a>
                <a href="mailto:contact@edurisk.ai" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600">
                  <Mail size={14} />
                </a>
              </div>
            </div>

            {/* Dashboards */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Dashboards</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Student Portal", href: "/student/dashboard" },
                  { label: "Faculty Workspace", href: "/faculty/dashboard" },
                  { label: "Dean / Admin", href: "/dean/dashboard" },
                  { label: "Login", href: "/login" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs hover:text-cyan-600 font-medium transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Technology", href: "#technology" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-xs hover:text-cyan-600 font-medium transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Contact</h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>📧 contact@edurisk.ai</li>
                <li>🏛 Global Polytechnic University</li>
                <li>📞 +91 98765 43210</li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Operational
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-medium">© 2024 EduRisk AI. Built with ❤️ as an enterprise capstone project.</p>
            <div className="flex gap-5 font-medium">
              <a href="#" className="text-xs hover:text-cyan-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs hover:text-cyan-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs hover:text-cyan-600 transition-colors">Data Security</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
