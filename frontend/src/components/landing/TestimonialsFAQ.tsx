"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "HOD, Computer Science — Global Polytechnic University",
    avatar: "PS",
    color: "violet",
    rating: 5,
    quote: "EduRisk AI completely transformed how I manage at-risk students. I used to manually check spreadsheets every week. Now I get automated alerts with AI-powered intervention suggestions. We reduced our department's dropout rate from 11% to 7% in one semester.",
  },
  {
    name: "Arjun Mehta",
    role: "Final Year B.Tech (CSE) Student",
    avatar: "AM",
    color: "blue",
    rating: 5,
    quote: "I didn't even realize I was falling behind until my AI Success Coach flagged it 4 weeks early. It suggested a weekly schedule adjustment and linked me to extra resources. I went from a 6.8 CGPA to 7.6 — I genuinely think this platform saved my semester.",
  },
  {
    name: "Dr. Sarah Johnson",
    role: "Dean of Academic Affairs",
    avatar: "SJ",
    color: "emerald",
    rating: 5,
    quote: "The Executive Dashboard is extraordinary. I can see real-time institutional health, department comparisons, AI forecasts, and NAAC compliance in one place. The What-If Policy Simulator alone saved us 3 months of manual scenario planning before our last audit.",
  },
  {
    name: "Prof. Ramesh Kumar",
    role: "Assistant Professor — Mechanical Engineering",
    avatar: "RK",
    color: "amber",
    rating: 5,
    quote: "My students in Mechanical Eng had an average attendance of 67%. The early warning system caught 12 students before their academic drop. After targeted interventions and counselling, we recovered 9 of them. This kind of data-driven approach is the future of education.",
  },
];

const faqs = [
  { q: "How accurate is the AI prediction model?", a: "EduRisk AI's model achieves 92.4% accuracy, 89.1% precision, and 91.7% recall on a validation dataset of 15,420+ student records across 7 semesters. Model performance is monitored monthly and retraining is triggered quarterly." },
  { q: "How is student data protected and kept private?", a: "All student data is encrypted at rest and in transit using AES-256 and TLS 1.3. Role-based access controls ensure students can only see their own data. Faculty see only their assigned students. Deans see aggregated institutional data. No personally identifiable information is exposed across roles." },
  { q: "Can universities customize risk thresholds and alerts?", a: "Yes. System administrators can configure dropout risk thresholds, attendance alert triggers, and intervention escalation rules through the System Administration panel. AI model parameters (like feature weights) can also be adjusted via the ML Config section." },
  { q: "Does it integrate with existing Learning Management Systems?", a: "EduRisk AI is designed with a REST API backend that supports standard LMS integrations. Current planned integrations include Moodle and Canvas. The API is fully documented and allows custom connectors for institutional LMS platforms." },
  { q: "Is the AI prediction explainable? Can faculty understand why a student is at risk?", a: "Absolutely. Every student risk score is backed by SHAP (SHapley Additive exPlanations) analysis, which shows the exact percentage contribution of each factor (attendance, marks, engagement, etc.) to the risk score. Faculty can see not just that a student is at risk, but exactly why." },
  { q: "Can this be deployed for small colleges with fewer than 500 students?", a: "Yes. The architecture scales from single-department pilots to full institutional deployments. The ML model performs well even with smaller datasets using transfer learning from the pretrained base model." },
];

const avatarColors: Record<string, string> = {
  violet: "bg-violet-600",
  blue: "bg-blue-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-500",
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

export function TestimonialsFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
                Trusted by Students, Faculty, and Leaders
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-base">
                Hear from the people whose academic lives and institutions have been transformed by EduRisk AI.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColors[t.color]} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-base">
                Everything you need to know before deploying EduRisk AI at your institution.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className={`rounded-2xl border transition-all ${openFaq === i ? "border-violet-200 bg-violet-50/50" : "border-slate-100 bg-white"}`}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-bold text-slate-900 pr-4">{f.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={16} className="text-violet-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-xs text-slate-500 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
