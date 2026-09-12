import React, { useEffect, useState } from "react";
import { X, Star, Loader2, Target, PenTool, CheckCircle, Brain, BookOpen } from "lucide-react";
import apiClient from "@/api/axios";

interface Rubric {
  writing: number;
  understanding: number;
  learning: number;
  application: number;
  knowledge: number;
}

interface AssessmentMark {
  id: number;
  title: string;
  type: string;
  status: string;
  total_marks: number;
  obtained_marks: number | null;
  graded_at: string | null;
  rubric: Rubric | null;
}

interface MarksData {
  assessments: AssessmentMark[];
  summary: {
    total_obtained: number;
    total_max: number;
    percentage: number;
  };
}

interface Props {
  courseId: string;
  courseName: string;
  onClose: () => void;
  studentId?: string;
}

export default function CourseMarksModal({ courseId, courseName, onClose, studentId }: Props) {
  const [data, setData] = useState<MarksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // We assume the caller passes the student_id or we get it from auth store.
        // Actually the backend endpoint requires studentId.
        // Let's get it from localStorage or we require it in props.
        let sid = studentId;
        if (!sid) {
          const authUser = localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage") as string)?.state?.user : null;
          sid = authUser?.student_id;
        }
        
        if (!sid) throw new Error("Student ID not found");
        
        const res = await apiClient.get(`/lms/student/${sid}/courses/${courseId}/marks`);
        setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e.message ?? "Failed to load marks");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, studentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star size={20} className="text-amber-500 fill-current" />
              Course Marks & Rubric
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{courseId} — {courseName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
              <p className="text-sm font-medium">Loading your marks...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          ) : !data || data.assessments.length === 0 ? (
            <div className="text-center py-20">
              <Star size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No assessments found for this course.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Total Course Performance</h3>
                  <p className="text-xs text-slate-500 mt-1">Based on graded assessments only</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-500">
                    {Math.round(data.summary.total_obtained)} <span className="text-sm text-slate-400 font-medium">/ {Math.round(data.summary.total_max)}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 mt-1">{Math.round(data.summary.percentage)}%</div>
                </div>
              </div>

              {/* Assignments */}
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Assessments</h3>
              <div className="space-y-4">
                {data.assessments.map(a => (
                  <div key={a.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{a.type}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                      </div>
                      <div className="text-right">
                        {a.status === 'Graded' ? (
                          <div className="text-lg font-bold text-slate-900">
                            {a.obtained_marks !== null ? Math.round(Number(a.obtained_marks)) : "-"} <span className="text-xs text-slate-400">/ {Math.round(Number(a.total_marks) || 50)}</span>
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-slate-400">Not Graded</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Rubric Details */}
                    {a.rubric && (
                      <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <PenTool size={14} className="mx-auto text-blue-500 mb-1" />
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Writing</div>
                          <div className="text-sm font-bold text-blue-700">{a.rubric.writing}/10</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-100">
                          <Brain size={14} className="mx-auto text-purple-500 mb-1" />
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Understanding</div>
                          <div className="text-sm font-bold text-purple-700">{a.rubric.understanding}/10</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                          <BookOpen size={14} className="mx-auto text-emerald-500 mb-1" />
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Learning</div>
                          <div className="text-sm font-bold text-emerald-700">{a.rubric.learning}/10</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100">
                          <Target size={14} className="mx-auto text-amber-500 mb-1" />
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Application</div>
                          <div className="text-sm font-bold text-amber-700">{a.rubric.application}/10</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-100">
                          <CheckCircle size={14} className="mx-auto text-rose-500 mb-1" />
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Knowledge</div>
                          <div className="text-sm font-bold text-rose-700">{a.rubric.knowledge}/10</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
