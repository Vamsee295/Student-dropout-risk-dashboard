"use client";

import { useEffect, useState } from "react";
import { BookOpen, Star, FileText, Video, MessageSquare, Loader2 } from "lucide-react";
import apiClient from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/services/authService";

interface CourseItem {
  code: string;
  name: string;
  credits: number;
  attendance: number;
  avgMarks: number;
  progress: number;
  color: string;
  topics: string;
  nextClass: string;
  pending: number;
  warning: string | null;
  faculty: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  amber: "bg-amber-500",
  purple: "bg-purple-600",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
};

const borderMap: Record<string, string> = {
  blue: "border-l-blue-500",
  indigo: "border-l-indigo-500",
  amber: "border-l-amber-400",
  purple: "border-l-purple-500",
  rose: "border-l-rose-400",
  emerald: "border-l-emerald-400",
};

export default function CoursesPage() {
  const { user: zustandUser } = useAuthStore();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = zustandUser?.student_id || authUser?.student_id || tokenStorage.getUser()?.student_id;

  useEffect(() => {
    if (!studentId) {
      if (!authLoading) {
        setLoading(false);
      }
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/student/${studentId}/courses`);
        if (isMounted) {
          setCourses(data);
          setError(null);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.response?.data?.detail ?? "Failed to load courses");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [studentId, authLoading]);

  const totalCredits = courses.reduce((a, c) => a + c.credits, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${courses.length} Enrolled Courses · ${totalCredits} Credits`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Semester Progress</p>
          <p className="text-lg font-bold text-blue-600 mt-0.5">Week 8 / 16</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Course Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No courses enrolled yet.</p>
            </div>
          ) : courses.map((course, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-l-4 border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${borderMap[course.color] ?? "border-l-slate-300"}`}>
              <div className="p-5">
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${colorMap[course.color] ?? "bg-slate-500"}`}>
                    {course.code.slice(0, 2)}<br />{course.code.slice(2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{course.code} · {course.credits} Credits{course.faculty ? ` · ${course.faculty}` : ""}</p>
                      </div>
                      {course.warning && (
                        <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold flex-shrink-0">⚠ {course.warning}</span>
                      )}
                    </div>
                    {course.nextClass && (
                      <p className="text-xs text-slate-500 mt-1.5">📅 Next: {course.nextClass}</p>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Attendance", value: `${course.attendance}%`, alert: course.attendance > 0 && course.attendance < 75 },
                    { label: "Avg Marks", value: course.avgMarks > 0 ? `${course.avgMarks}/100` : "—", alert: course.avgMarks > 0 && course.avgMarks < 70 },
                    { label: "Assignments", value: `${course.pending} pending`, alert: course.pending > 0 },
                  ].map((m, j) => (
                    <div key={j} className={`p-3 rounded-xl text-center ${m.alert ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"}`}>
                      <p className={`text-sm font-bold ${m.alert ? "text-red-600" : "text-slate-700"}`}>{m.value}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Lecture Notes", icon: <FileText size={12} /> },
                    { label: "Recorded Classes", icon: <Video size={12} /> },
                    { label: "Discussion", icon: <MessageSquare size={12} /> },
                    { label: "Marks", icon: <Star size={12} /> },
                  ].map((a, j) => (
                    <button key={j} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-medium transition-colors">
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
