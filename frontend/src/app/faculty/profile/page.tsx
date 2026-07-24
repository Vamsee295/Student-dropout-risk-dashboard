"use client";

import { UserCircle, Mail, Phone, MapPin, BookOpen, Clock, Award, Edit3 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const courses = ["CS301 – Database Management Systems", "CS302 – Operating Systems", "CS303 – Computer Networks", "HS101 – Technical Communication"];
const publications = [
  { title: "Machine Learning in Student Performance Prediction", journal: "Journal of Educational Technology", year: 2023 },
  { title: "Dropout Risk Analysis in Higher Education Institutions", journal: "IEEE Conference on AI in Education", year: 2022 },
];

export default function FacultyProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors">
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 text-3xl font-bold flex items-center justify-center mb-4">
            {user?.name ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") : "FA"}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name || "Dr. Faculty Member"}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Assistant Professor</p>
          <p className="text-xs text-slate-400 mt-0.5">Department of Computer Science</p>
          <div className="mt-4 space-y-2 w-full text-left">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{user?.email || "faculty@university.edu"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Phone size={14} className="text-slate-400 flex-shrink-0" />
              +91 98765 43210
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              Room 302, Engineering Block A
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-50 w-full">
            {[{ label: "Courses", value: 4 }, { label: "Students", value: 240 }, { label: "Exp.", value: "8 yrs" }].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Courses */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" /> Current Courses
            </h3>
            <div className="space-y-2">
              {courses.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-purple-500" /> Office Hours
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ day: "Tuesday", time: "2:00 PM – 4:00 PM", room: "Room 302" }, { day: "Friday", time: "3:00 PM – 5:00 PM", room: "Room 302" }].map((oh, i) => (
                <div key={i} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-sm font-bold text-purple-900">{oh.day}</p>
                  <p className="text-xs text-purple-600 mt-0.5">{oh.time}</p>
                  <p className="text-xs text-purple-500 mt-0.5">{oh.room}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Publications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Research Publications
            </h3>
            <div className="space-y-3">
              {publications.map((pub, i) => (
                <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-sm font-bold text-amber-900">{pub.title}</p>
                  <p className="text-xs text-amber-700 mt-1">{pub.journal}</p>
                  <p className="text-xs text-amber-500 mt-0.5">{pub.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
