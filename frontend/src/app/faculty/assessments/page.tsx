"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Upload, TrendingUp, AlertTriangle, CheckCircle2, Loader2, X, Users, Check, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "@/api/axios";

interface ExamItem {
  id: number;
  title: string;
  course: string;
  type: string;
  date: string;
  totalMarks: number;
  avgMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passRate: number;
  status: string;
  totalStudents: number;
  graded: number;
}

interface DistItem { range: string; count: number }

interface SubmissionItem {
  student_id: string;
  student_name: string;
  status: string;
  obtained_marks: number | null;
  writing_marks: number | null;
  understanding_marks: number | null;
  learning_marks: number | null;
  application_marks: number | null;
  knowledge_marks: number | null;
  submission_date: string | null;
  graded_at: string | null;
}

export default function AssessmentsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [activeExam, setActiveExam] = useState<ExamItem | null>(null);
  const [distribution, setDistribution] = useState<DistItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);
  const [form, setForm] = useState({ course_id: "", title: "", type: "INTERNAL", total_marks: 50, exam_date: "" });

  const [activeStudent, setActiveStudent] = useState<SubmissionItem | null>(null);
  const [rubric, setRubric] = useState({ writing: 0, understanding: 0, learning: 0, application: 0, knowledge: 0 });
  const [grading, setGrading] = useState(false);

  const loadExams = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/grades/faculty/exams");
      setExams(data);
      if (data.length > 0) {
        setActiveExam(data[0]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    apiClient.get("/faculty/my-courses").then(({ data }) => setCourses(data)).catch(() => {});

    // WebSocket for realtime updates
    let ws: WebSocket | null = null;
    const connectWs = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : (host === "localhost" ? ":8000" : "");
      ws = new WebSocket(`${protocol}//${host}${port}/api/v1/ws/dashboard?token=${token}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "assessment_submitted" || data.type === "assessment_graded_event") {
            // Simply trigger a refresh of the active exam if it matches, or reload the list
            loadExams();
            if (activeExam && activeExam.id === data.assessment_id) {
              loadExamDetails(activeExam);
            }
          }
        } catch (e) {}
      };
      
      ws.onclose = () => {
        setTimeout(connectWs, 3000);
      };
    };
    
    connectWs();
    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);


  const loadExamDetails = async (exam: ExamItem) => {
    setLoadingDist(true);
    setLoadingSubs(true);
    try {
      const [distRes, subsRes] = await Promise.all([
        apiClient.get(`/grades/faculty/exams/${exam.id}/stats`),
        apiClient.get(`/grades/faculty/exams/${exam.id}/submissions`)
      ]);
      setDistribution(distRes.data);
      setSubmissions(subsRes.data);
    } catch (e) {
      setDistribution([]);
      setSubmissions([]);
    } finally {
      setLoadingDist(false);
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    if (activeExam) {
      loadExamDetails(activeExam);
      setActiveStudent(null);
    }
  }, [activeExam?.id]);

  async function handleCreate() {
    if (!form.course_id || !form.title) return;
    setCreating(true);
    try {
      await apiClient.post("/grades/faculty/exams", form);
      setShowCreate(false);
      setForm({ course_id: "", title: "", type: "INTERNAL", total_marks: 50, exam_date: "" });
      await loadExams();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  function openGradePanel(sub: SubmissionItem) {
    setActiveStudent(sub);
    setRubric({
      writing: sub.writing_marks ?? 0,
      understanding: sub.understanding_marks ?? 0,
      learning: sub.learning_marks ?? 0,
      application: sub.application_marks ?? 0,
      knowledge: sub.knowledge_marks ?? 0
    });
  }

  async function submitGrade() {
    if (!activeExam || !activeStudent) return;
    setGrading(true);
    try {
      await apiClient.post(`/grades/faculty/exams/${activeExam.id}/grade-student`, {
        student_id: activeStudent.student_id,
        writing_marks: rubric.writing,
        understanding_marks: rubric.understanding,
        learning_marks: rubric.learning,
        application_marks: rubric.application,
        knowledge_marks: rubric.knowledge,
      });
      await loadExamDetails(activeExam);
      await loadExams();
      setActiveStudent(null);
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Failed to grade student");
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage exams, upload marks, and analyze performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus size={14} /> Create Exam
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Create Exam / Assessment</h3>
              <button onClick={() => setShowCreate(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Course</label>
                <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400">
                  <option value="">Select course…</option>
                  {courses.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mid-Term Exam"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400">
                    {["INTERNAL", "EXTERNAL", "LAB", "PRACTICAL"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Max Marks</label>
                  <input type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: +e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Exam Date</label>
                <input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleCreate} disabled={creating || !form.course_id || !form.title}
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1">
                  {creating ? <Loader2 size={13} className="animate-spin" /> : null} Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-1">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Exam Records</h3>
            </div>
            <div className="divide-y divide-slate-50 h-[800px] overflow-y-auto">
              {exams.length === 0 ? (
                <p className="text-sm text-slate-400 p-4 text-center">No exams yet</p>
              ) : exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => setActiveExam(exam)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${activeExam?.id === exam.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}`}
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">{exam.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{exam.course} · {exam.type}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${exam.status === "Published" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                      {exam.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Graded: {exam.graded}/{exam.totalStudents}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeExam && (
            <div className="xl:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{activeExam.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{activeExam.course} · {activeExam.type} · Max {activeExam.totalMarks} Marks</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Enrolled</p>
                      <p className="text-sm font-bold text-slate-800">{activeExam.totalStudents} Students</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Average", value: activeExam.avgMarks, icon: <TrendingUp size={16} />, color: "blue" },
                    { label: "Highest", value: activeExam.highestMarks, icon: <CheckCircle2 size={16} />, color: "emerald" },
                    { label: "Lowest", value: activeExam.lowestMarks, icon: <AlertTriangle size={16} />, color: "red" },
                    { label: "Pass Rate", value: `${activeExam.passRate}%`, icon: <ClipboardList size={16} />, color: "purple" },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl flex items-center gap-3 ${
                      stat.color === "blue" ? "bg-blue-50/50" : stat.color === "emerald" ? "bg-emerald-50/50" : stat.color === "red" ? "bg-red-50/50" : "bg-purple-50/50"
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        stat.color === "blue" ? "bg-blue-100 text-blue-600" : stat.color === "emerald" ? "bg-emerald-100 text-emerald-600" : stat.color === "red" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"
                      }`}>{stat.icon}</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-40">
                  {loadingDist ? (
                    <div className="flex items-center justify-center h-full"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distribution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip cursor={{fill: "#f8fafc"}} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 12 }} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Users size={16} className="text-slate-400" /> Student Submissions</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {loadingSubs ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-300" /></div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-500 uppercase font-semibold sticky top-0 bg-white/90 backdrop-blur pb-2 z-10">
                          <tr>
                            <th className="pb-3 px-2">Student</th>
                            <th className="pb-3 px-2">Status</th>
                            <th className="pb-3 px-2 text-right">Total Marks</th>
                            <th className="pb-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {submissions.map(sub => (
                            <tr key={sub.student_id} className="hover:bg-slate-50 group transition-colors">
                              <td className="py-3 px-2">
                                <div className="font-medium text-slate-900">{sub.student_name}</div>
                                <div className="text-xs text-slate-400">{sub.student_id}</div>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                  sub.status === "GRADED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {sub.status === "GRADED" && <Check size={10} />}
                                  {sub.status || "PENDING"}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right font-semibold text-slate-700">
                                {sub.obtained_marks !== null ? sub.obtained_marks : "-"} <span className="text-xs text-slate-400 font-normal">/ {activeExam.totalMarks}</span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <button 
                                  onClick={() => openGradePanel(sub)}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    activeStudent?.student_id === sub.student_id 
                                    ? "bg-emerald-600 text-white" 
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
                                  }`}>
                                  {sub.status === "GRADED" ? "Edit" : "Evaluate"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><ClipboardList size={16} className="text-slate-400"/> Rubric Evaluator</h3>
                  </div>
                  {activeStudent ? (
                    <div className="flex-1 flex flex-col overflow-y-auto p-5">
                      <div className="mb-5 pb-4 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{activeStudent.student_name}</p>
                        <p className="text-xs text-slate-500">{activeStudent.student_id}</p>
                      </div>

                      <div className="space-y-4 flex-1">
                        {[
                          { key: "writing", label: "Writing & Expression" },
                          { key: "understanding", label: "Understanding" },
                          { key: "learning", label: "Learning & Analysis" },
                          { key: "application", label: "Application" },
                          { key: "knowledge", label: "Knowledge Base" },
                        ].map((metric) => (
                          <div key={metric.key}>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-semibold text-slate-700">{metric.label}</label>
                              <span className="text-xs font-bold text-emerald-600">{(rubric as any)[metric.key]} <span className="text-slate-400 font-normal">/ 10</span></span>
                            </div>
                            <input 
                              type="range" min="0" max="10" step="0.5"
                              value={(rubric as any)[metric.key]}
                              onChange={(e) => setRubric({ ...rubric, [metric.key]: parseFloat(e.target.value) })}
                              className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-slate-600">Total Score</span>
                          <span className="text-2xl font-black text-slate-900">
                            {Object.values(rubric).reduce((a, b) => a + b, 0)} <span className="text-sm text-slate-400 font-medium">/ 50</span>
                          </span>
                        </div>
                        <button 
                          onClick={submitGrade} disabled={grading}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                          {grading ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                          Submit Evaluation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <FileText size={48} className="mb-3 opacity-20" />
                      <p className="text-sm">Select a student from the list<br/>to begin rubric evaluation.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
