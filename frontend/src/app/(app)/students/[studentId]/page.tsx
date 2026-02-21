"use client";

import { useState, use, useMemo } from "react";
import { useAnalysisStore, type AnalysisStudent } from "@/store/analysisStore";
import { NoDataGate } from "@/components/NoDataGate";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    Calendar,
    BookOpen,
    MessageSquare,
    MoreHorizontal,
    CheckCircle,
    Bell,
    Mail,
    User,
    FileText,
    ChevronRight,
    ChevronDown,
    ArrowRight,
    X,
} from "lucide-react";
import Link from "next/link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function StudentDetailPage(props: { params: Promise<{ studentId: string }> }) {
    const params = use(props.params);
    const students = useAnalysisStore((s) => s.students);
    const student = useMemo<AnalysisStudent | undefined>(
        () => students.find((s) => s.id === params.studentId),
        [students, params.studentId],
    );

    const [isRiskExpanded, setIsRiskExpanded] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [isReviewed, setIsReviewed] = useState(false);
    const [isEscalated, setIsEscalated] = useState(false);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [isCounselingModalOpen, setIsCounselingModalOpen] = useState(false);
    const [counselingDate, setCounselingDate] = useState("");
    const [counselingTime, setCounselingTime] = useState("");
    const [counselingType, setCounselingType] = useState("Academic");
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        showToast("Case note added to session.");
        setNoteText("");
        setIsNoteModalOpen(false);
    };

    const handleMarkReviewed = () => {
        setIsReviewed(true);
        showToast("Student profile marked as reviewed.");
    };

    const handleEscalate = () => {
        setIsEscalated(true);
        showToast("Case escalated to Dean of Students.", "error");
    };

    const handleScheduleCounselingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast(`Counseling scheduled for ${counselingDate} at ${counselingTime}.`);
        setIsCounselingModalOpen(false);
        setCounselingDate("");
        setCounselingTime("");
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Email notification logged.");
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailBody("");
    };

    if (!student) {
        return (
            <NoDataGate>
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                    <User size={48} className="text-gray-300 mb-3" />
                    <p className="text-lg font-medium">Student not found in current session.</p>
                    <Link href="/students" className="mt-4 text-indigo-600 hover:underline">Return to list</Link>
                </div>
            </NoDataGate>
        );
    }

    const riskScore = student.riskScore;
    const riskLevel = student.riskLevel;
    const isHighRisk = riskLevel === "High Risk";
    const attendance = student.attendance_rate ?? 0;
    const engagement = student.engagement_score ?? 0;
    const initials = student.avatar || student.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const classAvg = 90;
    const attendanceHistory = Array.from({ length: 8 }, (_, i) => ({
        week: `Week ${i + 1}`,
        student: Math.round(Math.min(100, attendance + (7 - i) * 3)),
        classAvg: Math.round(classAvg + (7 - i) * 0.3),
    }));

    const riskFactors = [];
    if (attendance < 75) riskFactors.push({ feature: "attendance_rate", impact: 0.3, direction: "negative" });
    if (engagement < 50) riskFactors.push({ feature: "engagement_score", impact: 0.25, direction: "negative" });
    if (riskScore > 60) riskFactors.push({ feature: "dropout_probability", impact: 0.2, direction: "negative" });
    if (attendance >= 85) riskFactors.push({ feature: "attendance_rate", impact: 0.15, direction: "positive" });
    if (engagement >= 70) riskFactors.push({ feature: "engagement_score", impact: 0.1, direction: "positive" });

    return (
        <NoDataGate>
            <div className="space-y-6 relative">
                {toastMessage && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>
                        {toastType === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {toastMessage}
                    </div>
                )}

                {/* Note Modal */}
                {isNoteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Add Case Note</h3>
                                <button onClick={() => setIsNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter notes about this student..." className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-4" />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleAddNote} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Note</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Counseling Modal */}
                {isCounselingModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Schedule Counseling</h3>
                                <button onClick={() => setIsCounselingModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleScheduleCounselingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                                    <select value={counselingType} onChange={(e) => setCounselingType(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Academic Performance</option>
                                        <option>Personal Counseling</option>
                                        <option>Career Guidance</option>
                                        <option>Attendance Issues</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input type="date" required value={counselingDate} onChange={(e) => setCounselingDate(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input type="time" required value={counselingTime} onChange={(e) => setCounselingTime(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button type="button" onClick={() => setIsCounselingModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Create Appointment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Email Modal */}
                {isEmailModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Send Email</h3>
                                <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                    <input type="text" value={`student.${params.studentId}@university.edu`} disabled className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input type="text" required value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g., Mandatory Counseling Session" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea required value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your message here..." className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none" />
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Discard</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"><Mail size={16} /> Send Email</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-900">Student Risk Profile</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                            <ChevronRight size={14} />
                            <Link href="/students" className="hover:text-indigo-600">Students</Link>
                            <ChevronRight size={14} />
                            <span className="text-gray-900 font-medium">{student.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsNoteModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                            <FileText size={16} /> Add Case Note
                        </button>
                        <button onClick={handleMarkReviewed} disabled={isReviewed} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${isReviewed ? "bg-green-50 border-green-200 text-green-700 cursor-default" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                            <CheckCircle size={16} className={isReviewed ? "text-green-600" : "text-gray-400"} />
                            {isReviewed ? "Reviewed" : "Mark as Reviewed"}
                        </button>
                        <button onClick={handleEscalate} disabled={isEscalated} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${isEscalated ? "bg-red-100 border-red-200 text-red-800 cursor-default" : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"}`}>
                            <AlertTriangle size={16} />
                            {isEscalated ? "Escalated" : "Escalate"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Profile & Risk Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                                                {isHighRisk ? (
                                                    <div className="relative">
                                                        <span className="absolute bottom-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full"></span>
                                                        {initials}
                                                    </div>
                                                ) : initials}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{student.name}</h2>
                                                <p className="text-sm text-gray-500 mt-1 font-medium">ID: #{student.id} {student.department ? `• ${student.department}` : ""} • {riskLevel}</p>
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setIsEmailModalOpen(true); }} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                                        <Mail size={14} /> {`student.${student.id}@university.edu`}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Factors */}
                                        <div className="mt-8">
                                            <button onClick={() => setIsRiskExpanded(!isRiskExpanded)} className="flex items-center justify-between w-full group py-2">
                                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-red-500" />
                                                    Risk Factor Analysis
                                                </h3>
                                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isRiskExpanded ? "rotate-180" : ""}`} />
                                            </button>
                                            {isRiskExpanded && (
                                                <div className="mt-2 space-y-3 pl-0">
                                                    {riskFactors.map((factor, idx) => (
                                                        <div key={idx} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-0 border-gray-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${factor.direction === "negative" ? "bg-red-500" : "bg-green-500"}`}></div>
                                                                <span className="text-sm text-gray-700 font-medium capitalize">{factor.feature.replace(/_/g, " ")}</span>
                                                            </div>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${factor.direction === "negative" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                                                                {factor.direction === "negative" ? "Critical Impact" : "Positive Factor"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {riskFactors.length === 0 && (
                                                        <p className="text-sm text-gray-400 italic pl-6">No specific risk factors identified.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Risk Gauge */}
                                    <div className={`w-full md:w-[320px] rounded-xl p-6 flex flex-col items-center justify-center border relative overflow-hidden ${isHighRisk ? "bg-red-50/50 border-red-100" : riskLevel === "Moderate Risk" ? "bg-amber-50/50 border-amber-100" : "bg-green-50/50 border-green-100"}`}>
                                        <div className="relative h-32 w-32 flex items-center justify-center">
                                            <svg className="transform -rotate-90 w-32 h-32">
                                                <circle cx="64" cy="64" r="54" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                                                <circle
                                                    cx="64" cy="64" r="54"
                                                    stroke={isHighRisk ? "#dc2626" : riskLevel === "Moderate Risk" ? "#f59e0b" : "#10b981"}
                                                    strokeWidth="10" fill="transparent"
                                                    strokeDasharray={`${2 * Math.PI * 54}`}
                                                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - riskScore / 100)}`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <span className="absolute text-3xl font-bold text-gray-900">{riskScore.toFixed(0)}%</span>
                                        </div>
                                        <h3 className={`mt-4 font-bold text-sm uppercase tracking-wider ${isHighRisk ? "text-red-700" : riskLevel === "Moderate Risk" ? "text-amber-700" : "text-green-700"}`}>{riskLevel}</h3>
                                        <p className="text-xs text-gray-500 text-center mt-1 px-4 leading-relaxed">Predicted dropout probability from session analysis.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50/80 px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
                                <span>Session analysis — data from your imported CSV</span>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-amber-400 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">LMS Activity</p>
                                <h3 className="text-xl font-bold text-gray-900">{engagement > 50 ? "Active" : "Inactive"}</h3>
                                <p className="text-xs text-gray-500 mt-2">Engagement: {engagement.toFixed(0)}%</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Engagement</p>
                                <h3 className="text-xl font-bold text-gray-900">{engagement.toFixed(1)}%</h3>
                                <p className="text-xs text-gray-500 mt-2">{engagement >= 70 ? "Above average" : "Below average"}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-amber-400 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Attendance</p>
                                <h3 className="text-xl font-bold text-gray-900">{attendance.toFixed(1)}%</h3>
                                <p className="text-xs text-gray-500 mt-2">{attendance < 75 ? "Below 75% threshold" : "Above threshold"}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-red-500 border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Risk Score</p>
                                <h3 className="text-xl font-bold text-gray-900">{riskScore.toFixed(0)}%</h3>
                                <p className="text-xs text-gray-500 mt-2">{riskLevel}</p>
                            </div>
                        </div>

                        {/* Attendance Chart */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-indigo-600" />
                                    Attendance History
                                </h3>
                                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">This Semester</span>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={attendanceHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 100]} dx={-10} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                        <Line type="monotone" dataKey="classAvg" name="Class Avg" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                        <Line type="monotone" dataKey="student" name="Student" stroke={isHighRisk ? "#f87171" : "#6366f1"} strokeWidth={3} dot={{ r: 4, fill: isHighRisk ? "#f87171" : "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" />
                                Recommended Actions
                            </h3>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Intervention suggestions based on risk analysis.</p>
                            <div className="space-y-3">
                                <button onClick={() => setIsCounselingModalOpen(true)} className="w-full flex items-center justify-between p-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                                    <span className="flex items-center gap-2.5 font-medium text-sm"><Calendar size={18} /> Schedule Counseling</span>
                                    <ArrowRight size={18} />
                                </button>
                                <button onClick={() => setIsEmailModalOpen(true)} className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                                    <span className="flex items-center gap-2.5 font-medium text-sm"><Mail size={18} /> Email Student</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5">Session Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Department</span>
                                    <span className="text-sm font-bold text-gray-900">{student.department || "—"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Risk Level</span>
                                    <span className={`text-sm font-bold ${isHighRisk ? "text-red-600" : riskLevel === "Moderate Risk" ? "text-amber-600" : "text-green-600"}`}>{riskLevel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Attendance</span>
                                    <span className="text-sm font-bold text-gray-900">{attendance.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Engagement</span>
                                    <span className="text-sm font-bold text-gray-900">{engagement.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NoDataGate>
    );
}
