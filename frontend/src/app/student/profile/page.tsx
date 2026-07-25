"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { User, GraduationCap, MapPin, Phone, Mail, Edit2, Star, TrendingUp, Award, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const studentData = {
    name: user?.name || "Alex Johnson",
    email: user?.email || "student@gmail.com",
    roll: "CS21B056",
    department: "Computer Science & Engineering",
    semester: "5th Semester (3rd Year)",
    section: "Section A",
    dob: "March 15, 2003",
    phone: "+91 98765 43210",
    address: "Chennai, Tamil Nadu",
    blood: "O+",
    advisor: "Dr. Sunita Mehta",
    hostel: "Mens Hostel Block-C",
    category: "General",
    entranceScore: "JEE Mains 2021 – 94.7 Percentile",
    cgpa: "8.24",
    attendance: "78%",
    rank: "#12 of 180",
    totalCredits: "85/180",
  };

  const achievements = [
    { label: "Best Project – Hackathon 2023", icon: "🏆" },
    { label: "AWS Certified Cloud Practitioner", icon: "☁️" },
    { label: "Dean's Honor List – Sem 3", icon: "🏅" },
    { label: "Runner Up – Coding Contest 2022", icon: "🥈" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your academic and personal information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-black">
              {studentData.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-blue-400">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black">{studentData.name}</h2>
              <button className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"><Edit2 size={12} /></button>
            </div>
            <p className="text-blue-200 text-sm">{studentData.roll} · {studentData.department}</p>
            <p className="text-blue-200 text-xs mt-1">{studentData.semester} · {studentData.section}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-semibold flex items-center gap-1.5">
                <GraduationCap size={12} /> B.Tech Student
              </span>
              <span className="text-xs px-3 py-1 bg-emerald-400/30 text-emerald-200 rounded-full font-semibold border border-emerald-400/30">
                🟢 Active Enrollment
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "CGPA", value: studentData.cgpa },
              { label: "Attendance", value: studentData.attendance },
              { label: "Class Rank", value: studentData.rank },
              { label: "Credits", value: studentData.totalCredits },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/15 rounded-xl px-4 py-2.5">
                <p className="text-lg font-black">{s.value}</p>
                <p className="text-[10px] text-blue-200 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-blue-600" /> Personal Information
          </h3>
          <div className="space-y-3">
            {[
              { label: "Full Name", value: studentData.name },
              { label: "Date of Birth", value: studentData.dob },
              { label: "Blood Group", value: studentData.blood },
              { label: "Category", value: studentData.category },
              { label: "Phone", value: studentData.phone },
              { label: "Email", value: studentData.email },
              { label: "Address", value: studentData.address },
            ].map((f, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                <p className="text-xs font-semibold text-slate-700 text-right max-w-48">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap size={16} className="text-indigo-600" /> Academic Information
          </h3>
          <div className="space-y-3">
            {[
              { label: "Roll Number", value: studentData.roll },
              { label: "Department", value: studentData.department },
              { label: "Current Semester", value: studentData.semester },
              { label: "Section", value: studentData.section },
              { label: "Academic Advisor", value: studentData.advisor },
              { label: "Hostel", value: studentData.hostel },
              { label: "Entrance Score", value: studentData.entranceScore },
            ].map((f, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                <p className="text-xs font-semibold text-slate-700 text-right max-w-48">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award size={16} className="text-amber-500" /> Achievements & Certifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-xl">{a.icon}</span>
              <p className="text-xs font-semibold text-amber-900">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Edit2 size={15} /> Edit Profile
        </button>
      </div>
    </div>
  );
}
