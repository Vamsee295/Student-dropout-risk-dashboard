"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Crown, Building, Mail, Phone, Calendar, BookOpen, Edit2, Camera, Award } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuthStore();

  const adminData = {
    name: user?.name || "Dr. Sarah Johnson",
    email: user?.email || "dean@gmail.com",
    designation: "Dean of Academic Affairs",
    department: "Academic Administration",
    institution: "Global Polytechnic University",
    experience: "22 years",
    phone: "+91 98765 43210",
    office: "Block A, Room 101 — Dean's Office",
    specialization: "Educational Technology & Policy Management",
    researchInterests: "AI in Education, Institutional Quality Management",
    publications: 34,
    conferences: 18,
    doctoralStudents: 6,
    lastLogin: new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }),
  };

  const responsibilities = [
    "Oversee institutional academic policies and curriculum development",
    "Manage faculty hiring, promotion, and performance evaluation",
    "Lead NAAC and NBA accreditation preparation and compliance",
    "Approve department budgets and resource allocations",
    "Represent the institution at UGC and AICTE regulatory bodies",
    "Chair Academic Council and Board of Studies meetings",
    "Implement AI-powered student success and dropout prevention strategies",
    "Strategic planning and institutional growth roadmap",
  ];

  const achievements = [
    { icon: "🏆", label: "Excellence in Educational Leadership Award 2022" },
    { icon: "🏅", label: "NAAC A Grade — Led accreditation successfully (2022)" },
    { icon: "📖", label: "34 Research Papers in Scopus/UGC Journals" },
    { icon: "🌐", label: "UNESCO Education Policy Consultant 2021–23" },
  ];

  const initials = adminData.name.split(" ").filter((n) => !n.startsWith("Dr") && !n.startsWith("Prof")).map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Admin Profile</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Executive Administrator — Institutional Command Access</p>
      </div>

      {/* Profile Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-violet-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-violet-700/50 border-2 border-violet-400 flex items-center justify-center text-2xl font-black">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full border-2 border-white flex items-center justify-center hover:bg-violet-500">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black">{adminData.name}</h2>
              <button className="p-1 rounded-lg bg-white/20 hover:bg-white/30"><Edit2 size={11} /></button>
            </div>
            <p className="text-violet-200 text-sm">{adminData.designation}</p>
            <p className="text-violet-300 text-xs mt-0.5">{adminData.institution}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-semibold flex items-center gap-1.5"><Crown size={10} /> Dean / Admin</span>
              <span className="text-xs px-3 py-1 bg-emerald-400/30 text-emerald-200 rounded-full font-semibold border border-emerald-400/30">🟢 Active Access</span>
              <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-semibold">{adminData.experience} Experience</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Research Papers", value: adminData.publications },
              { label: "Conferences", value: adminData.conferences },
              { label: "PhD Students", value: adminData.doctoralStudents },
              { label: "Years Exp.", value: adminData.experience.split(" ")[0] },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/15 rounded-xl px-4 py-2.5 border border-white/20">
                <p className="text-lg font-black">{s.value}</p>
                <p className="text-[10px] text-violet-300 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Contact & Office */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Building size={16} className="text-violet-600" /> Contact & Office</h3>
          <div className="space-y-3">
            {[
              { label: "Email", value: adminData.email, icon: <Mail size={13} className="text-zinc-400" /> },
              { label: "Phone", value: adminData.phone, icon: <Phone size={13} className="text-zinc-400" /> },
              { label: "Office", value: adminData.office, icon: <Building size={13} className="text-zinc-400" /> },
              { label: "Department", value: adminData.department, icon: <Crown size={13} className="text-zinc-400" /> },
              { label: "Last Login", value: adminData.lastLogin, icon: <Calendar size={13} className="text-zinc-400" /> },
              { label: "Specialization", value: adminData.specialization, icon: <BookOpen size={13} className="text-zinc-400" /> },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-50 last:border-0">
                <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-400 font-medium">{f.label}</p>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Crown size={16} className="text-violet-600" /> Administrative Responsibilities</h3>
          <ul className="space-y-2.5">
            {responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-black text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Award size={16} className="text-amber-500" /> Achievements & Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-xl">{a.icon}</span>
              <p className="text-xs font-semibold text-amber-900">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          <Edit2 size={15} /> Edit Profile
        </button>
      </div>
    </div>
  );
}
