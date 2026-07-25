"use client";

import { useState } from "react";
import { Briefcase, Star, TrendingUp, ExternalLink, CheckCircle2, Circle, BookOpen, Award } from "lucide-react";

const skills = [
  { name: "Python", level: 78, category: "Programming" },
  { name: "SQL & DBMS", level: 85, category: "Database" },
  { name: "Machine Learning", level: 52, category: "AI/ML" },
  { name: "React & JavaScript", level: 65, category: "Web Dev" },
  { name: "Data Structures", level: 72, category: "CS Fundamentals" },
  { name: "Computer Networks", level: 60, category: "Networking" },
  { name: "Communication Skills", level: 80, category: "Soft Skills" },
  { name: "Problem Solving", level: 74, category: "Soft Skills" },
];

const jobs = [
  { title: "Software Engineer Intern", company: "Google India", location: "Bangalore", type: "Internship", ctc: "₹50K/month", match: 82, skills: ["Python", "DSA", "SQL"], deadline: "Feb 10, 2024" },
  { title: "Data Analyst Intern", company: "Flipkart", location: "Bangalore", type: "Internship", ctc: "₹30K/month", match: 78, skills: ["SQL", "Python", "Excel"], deadline: "Feb 15, 2024" },
  { title: "ML Research Intern", company: "Microsoft", location: "Hyderabad", type: "Internship", ctc: "₹45K/month", match: 61, skills: ["ML", "Python", "Statistics"], deadline: "Jan 30, 2024" },
  { title: "Web Dev Intern", company: "Zomato", location: "Gurugram", type: "Internship", ctc: "₹25K/month", match: 75, skills: ["React", "Node.js", "MongoDB"], deadline: "Feb 20, 2024" },
];

const certifications = [
  { name: "AWS Cloud Practitioner", provider: "Amazon", status: "completed", date: "Dec 2023", icon: "🏆" },
  { name: "Google Data Analytics", provider: "Google / Coursera", status: "in-progress", progress: 65, icon: "📊" },
  { name: "Meta Front-End Developer", provider: "Meta / Coursera", status: "not-started", icon: "💻" },
  { name: "IBM ML with Python", provider: "IBM / edX", status: "not-started", icon: "🤖" },
];

export default function CareerPage() {
  const [tab, setTab] = useState<"skills" | "jobs" | "certs" | "roadmap">("skills");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Career & Skills</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track your skills, explore opportunities, and build your career</p>
      </div>

      {/* Career Readiness Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-blue-200 font-semibold uppercase mb-1">AI Career Score</p>
            <p className="text-3xl font-black">72 / 100</p>
            <p className="text-blue-100 text-sm mt-1">Placement Ready in 4 months</p>
            <p className="text-xs text-blue-200 mt-2">Top skills to add: ML, System Design, Cloud</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-2 rounded-xl">
              <CheckCircle2 size={13} className="text-emerald-300" />
              <span>AWS Certification Complete</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-2 rounded-xl">
              <CheckCircle2 size={13} className="text-emerald-300" />
              <span>Resume in Progress</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-2 rounded-xl">
              <Circle size={13} className="text-blue-300" />
              <span>LinkedIn Profile Incomplete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 flex-wrap">
        {[
          { key: "skills", label: "Skills" },
          { key: "jobs", label: "Job Matches" },
          { key: "certs", label: "Certifications" },
          { key: "roadmap", label: "Roadmap" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === "skills" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-5">Skill Proficiency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                      <span className="font-bold text-blue-600">{s.level}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${s.level}%`, backgroundColor: s.level >= 70 ? "#10b981" : s.level >= 55 ? "#3b82f6" : "#f59e0b" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-900 mb-2">🤖 AI Skill Gap Analysis</p>
            <p className="text-xs text-blue-700">For your target role (SDE Intern), your <strong>ML score (52%)</strong> and <strong>React skills (65%)</strong> are below the market benchmark of 70%. Spend 6-8 weeks on ML fundamentals and 2 projects to close the gap.</p>
          </div>
        </div>
      )}

      {tab === "jobs" && (
        <div className="space-y-4">
          {jobs.map((j, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{j.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{j.company} · {j.location}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${j.match >= 75 ? "text-emerald-600" : j.match >= 60 ? "text-blue-600" : "text-amber-600"}`}>{j.match}%</div>
                  <p className="text-[10px] text-slate-400">match score</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {j.skills.map((s, si) => (
                  <span key={si} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-semibold">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>💰 {j.ctc}</span>
                  <span>📅 Deadline: {j.deadline}</span>
                  <span>🏷 {j.type}</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Apply Now <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "certs" && (
        <div className="space-y-4">
          {certifications.map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${
              c.status === "completed" ? "border-emerald-200" :
              c.status === "in-progress" ? "border-blue-200" : "border-slate-100"
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-400">{c.provider}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      c.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                      c.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}>{c.status === "completed" ? "✓ Completed" : c.status === "in-progress" ? "In Progress" : "Not Started"}</span>
                  </div>
                  {c.status === "in-progress" && c.progress && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span><span className="font-semibold text-blue-600">{c.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {c.status === "completed" && c.date && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">Completed: {c.date}</p>
                  )}
                  {c.status !== "completed" && (
                    <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                      {c.status === "in-progress" ? "Continue Course" : "Start Learning"} <ExternalLink size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "roadmap" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-5">6-Month Placement Roadmap</h3>
          <div className="space-y-4">
            {[
              { month: "Feb 2024", tasks: ["Complete Google Data Analytics cert", "Start DSA practice (LeetCode)", "Build DBMS project on GitHub"], done: false, current: true },
              { month: "Mar 2024", tasks: ["Solve 50 LeetCode problems", "Build ML project (prediction model)", "Apply for summer internships"], done: false, current: false },
              { month: "Apr 2024", tasks: ["Complete 2 capstone projects", "Start competitive programming", "Attend placement preparation workshops"], done: false, current: false },
              { month: "May 2024", tasks: ["Resume finalizing", "Mock interview practice", "LinkedIn profile optimization"], done: false, current: false },
              { month: "Jun 2024", tasks: ["Campus placement interviews", "Off-campus applications", "HR round preparation"], done: false, current: false },
            ].map((step, i) => (
              <div key={i} className={`flex gap-4 ${step.current ? "opacity-100" : "opacity-70"}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step.done ? "bg-emerald-100 text-emerald-600" : step.current ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>{i + 1}</div>
                  {i < 4 && <div className="w-0.5 h-8 bg-slate-100 mt-1" />}
                </div>
                <div className={`flex-1 pb-4 ${step.current ? "bg-blue-50 border border-blue-100 rounded-xl p-3 -mt-1" : ""}`}>
                  <p className={`text-xs font-bold mb-2 ${step.current ? "text-blue-800" : "text-slate-600"}`}>{step.month}{step.current ? " (Now)" : ""}</p>
                  <ul className="space-y-1">
                    {step.tasks.map((t, ti) => (
                      <li key={ti} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Circle size={10} className="text-slate-300 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
