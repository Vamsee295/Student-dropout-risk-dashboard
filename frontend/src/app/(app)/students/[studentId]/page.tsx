"use client";

import { useEffect, useState, use } from "react";
import { facultyService, type StudentSummary } from "@/services/faculty";
import { studentService, type StudentOverview, type RiskDetails } from "@/services/student";
import {
    Loader2,
    ArrowLeft,
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
    Clock,
    FileText,
    ChevronRight,
    ChevronDown,
    ArrowRight,
    X,
    MessageCircle,
    Check
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
    AreaChart,
    Area
} from "recharts";
import ChatWidget from "@/components/ChatWidget";
import { GlobalRankChart } from "@/components/profile/GlobalRankChart";
import { ScoreDistributionChart } from "@/components/profile/ScoreDistributionChart";

export default function StudentDetailPage(props: { params: Promise<{ studentId: string }> }) {
    const params = use(props.params);
    const [overview, setOverview] = useState<StudentOverview | null>(null);
    const [risk, setRisk] = useState<RiskDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRiskExpanded, setIsRiskExpanded] = useState(true);

    // Interaction States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [isReviewed, setIsReviewed] = useState(false);
    const [isEscalated, setIsEscalated] = useState(false);

    // Modal States
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteText, setNoteText] = useState("");

    const [isCounselingModalOpen, setIsCounselingModalOpen] = useState(false);
    const [counselingDate, setCounselingDate] = useState("");
    const [counselingTime, setCounselingTime] = useState("");
    const [counselingType, setCounselingType] = useState("Academic");

    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
    const [hasPeerMentor, setHasPeerMentor] = useState(false);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    // Mock Mentors Data
    const availableMentors = [
        { id: "M01", name: "Prof. Sarah Connor", role: "Senior Faculty", dept: "Computer Science" },
        { id: "M02", name: "Dr. Alan Grant", role: "Academic Advisor", dept: "Mathematics" },
        { id: "S01", name: "Emily Watson", role: "Peer Mentor (Senior)", dept: "Computer Science" },
        { id: "S02", name: "Raj Patel", role: "Peer Mentor (Senior)", dept: "Data Science" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewData, riskData] = await Promise.all([
                    studentService.getOverview(params.studentId),
                    studentService.getRisk(params.studentId)
                ]);
                setOverview(overviewData);
                setRisk(riskData);
            } catch (error) {
                console.error("Failed to fetch student details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.studentId]);

    // Toast Notification Helper
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Action Handlers ---

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        showToast("Case note added successfully to student record.");
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
        showToast(`Counseling scheduled for ${counselingDate} without ${counselingTime}.`);
        setIsCounselingModalOpen(false);
        setCounselingDate("");
        setCounselingTime("");
    };

    const handleAssignMentorSubmit = () => {
        if (!selectedMentor) return;
        setHasPeerMentor(true);
        const mentorName = availableMentors.find(m => m.id === selectedMentor)?.name;
        showToast(`Mentor ${mentorName} assigned successfully.`);
        setIsMentorModalOpen(false);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Email sent to student successfully.");
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailBody("");
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!overview || !risk) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>Student not found or error loading data.</p>
                <Link href="/students" className="mt-4 text-indigo-600 hover:underline">Return to list</Link>
            </div>
        )
    }

    const isHighRisk = risk.risk_level === "High Risk";
    const riskScore = risk.risk_score;

    // Mock trend data for "Attendance History" graph
    const attendanceHistory = [
        { week: 'Week 1', student: 98, classAvg: 95 },
        { week: 'Week 2', student: 96, classAvg: 94 },
        { week: 'Week 3', student: 85, classAvg: 93 },
        { week: 'Week 4', student: 80, classAvg: 92 },
        { week: 'Week 5', student: 75, classAvg: 91 },
        { week: 'Week 6', student: 65, classAvg: 90 },
        { week: 'Week 7', student: overview.attendance_rate, classAvg: 89 },
        { week: 'Week 8', student: overview.attendance_rate - 2, classAvg: 89 }, // Projection
    ];

    return (
        <div className="space-y-6 relative">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toastType === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {toastMessage}
                </div>
            )}

            {/* --- Modals --- */}

            {/* Note Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Add Case Note</h3>
                            <button onClick={() => setIsNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter notes about this student's risk factors or recent interactions..."
                            className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-4"
                        />
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Schedule Counseling</h3>
                            <button onClick={() => setIsCounselingModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleScheduleCounselingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                                <select
                                    value={counselingType}
                                    onChange={(e) => setCounselingType(e.target.value)}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Academic Performance</option>
                                    <option>Personal Counseling</option>
                                    <option>Career Guidance</option>
                                    <option>Attendance Issues</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={counselingDate}
                                        onChange={(e) => setCounselingDate(e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={counselingTime}
                                        onChange={(e) => setCounselingTime(e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
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

            {/* Mentor Selection Modal */}
            {isMentorModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Assign Mentor</h3>
                            <button onClick={() => setIsMentorModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Select a mentor from the available list of faculty and senior students.</p>
                        <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
                            {availableMentors.map((mentor) => (
                                <div
                                    key={mentor.id}
                                    onClick={() => setSelectedMentor(mentor.id)}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${selectedMentor === mentor.id
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{mentor.name}</p>
                                        <p className="text-xs text-gray-500">{mentor.role} • {mentor.dept}</p>
                                    </div>
                                    {selectedMentor === mentor.id && <CheckCircle size={18} className="text-blue-600" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsMentorModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button
                                onClick={handleAssignMentorSubmit}
                                disabled={!selectedMentor}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Student Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Send Email</h3>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                <input
                                    type="text"
                                    value="john.student@university.edu"
                                    disabled
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="e.g., Mandatory Counseling Session"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Discard</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                                    <Mail size={16} /> Send Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Advisor Chat Widget */}
            <ChatWidget
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                advisorName="Dr. R. Miles"
                advisorRole="Dean of Students"
            />

            {/* Header Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-900">Actionable Student Risk Profile</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <ChevronRight size={14} />
                        <Link href="/students" className="hover:text-indigo-600">Students</Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium">Risk Profiles</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        <FileText size={16} />
                        Add Case Note
                    </button>
                    <button
                        onClick={handleMarkReviewed}
                        disabled={isReviewed}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${isReviewed
                            ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <CheckCircle size={16} className={isReviewed ? "text-green-600" : "text-gray-400"} />
                        {isReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                    </button>
                    <button
                        onClick={handleEscalate}
                        disabled={isEscalated}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${isEscalated
                            ? 'bg-red-100 border-red-200 text-red-800 cursor-default'
                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                            }`}
                    >
                        <AlertTriangle size={16} />
                        {isEscalated ? 'Escalated' : 'Escalate'}
                    </button>
                    <div className="h-8 w-px bg-gray-200 mx-1"></div>
                    <div className="relative group">
                        <Bell size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Student Profile & Risk Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Student Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                                            {overview.risk_level === 'High Risk' ? (
                                                <div className="relative">
                                                    <span className="absolute bottom-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full"></span>
                                                    JP
                                                </div>
                                            ) : 'JP'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">John Student</h2>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">ID: #{params.studentId} • B.S. Computer Science • Semester 4</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                <a href="#" onClick={(e) => { e.preventDefault(); setIsEmailModalOpen(true); }} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                                    <Mail size={14} />
                                                    john.student@university.edu
                                                </a>
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    (555) 123-4567
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Factors Section */}
                                    <div className="mt-8">
                                        <button
                                            onClick={() => setIsRiskExpanded(!isRiskExpanded)}
                                            className="flex items-center justify-between w-full group py-2"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <AlertTriangle size={16} className="text-red-500" />
                                                Why is this student high risk?
                                            </h3>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isRiskExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isRiskExpanded && (
                                            <div className="mt-2 space-y-3 pl-0 animate-in slide-in-from-top-2 duration-300">
                                                {risk.explanation?.top_factors.map((factor, idx) => (
                                                    <div key={idx} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-0 border-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${factor.direction === 'negative' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                            <span className="text-sm text-gray-700 font-medium capitalize">{factor.feature.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${factor.direction === 'negative'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-green-50 text-green-700'
                                                            }`}>
                                                            {factor.direction === 'negative' ? 'Critical Impact' : 'Positive Factor'}
                                                        </span>
                                                    </div>
                                                ))}
                                                {(!risk.explanation || risk.explanation.top_factors.length === 0) && (
                                                    <p className="text-sm text-gray-400 italic pl-6">No specific risk factors identified.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Risk Gauge */}
                                <div className="w-full md:w-[320px] bg-red-50/50 rounded-xl p-6 flex flex-col items-center justify-center border border-red-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <AlertTriangle size={120} className="text-red-900" />
                                    </div>
                                    <div className="relative h-32 w-32 flex items-center justify-center">
                                        {/* Simple SVG Circular Progress Mock */}
                                        <svg className="transform -rotate-90 w-32 h-32">
                                            <circle cx="64" cy="64" r="54" stroke="#fee2e2" strokeWidth="10" fill="transparent" />
                                            <circle
                                                cx="64" cy="64" r="54"
                                                stroke="#dc2626"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${2 * Math.PI * 54}`}
                                                strokeDashoffset={`${2 * Math.PI * 54 * (1 - riskScore / 100)}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <span className="absolute text-3xl font-bold text-gray-900">{riskScore.toFixed(0)}%</span>
                                    </div>
                                    <h3 className="mt-4 text-red-700 font-bold text-sm uppercase tracking-wider">Critical Risk Level</h3>
                                    <p className="text-xs text-red-600/80 text-center mt-1 px-4 leading-relaxed">Predicted dropout probability based on recent activity.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50/80 px-6 py-3 text-xs text-gray-500 border-t border-gray-100 flex justify-between items-center">
                            <span>Projected Impact: <strong className="text-red-600 font-bold">High Risk</strong> → <strong className="text-amber-500 font-bold">Medium Risk</strong> via Intervention</span>
                            <span>Last updated: 2 hours ago</span>
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-amber-400 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LMS Activity</p>
                                <div className="p-1 bg-amber-50 rounded">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">Inactive</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">No login for 5 days</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-red-500 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Grade Trend</p>
                                <div className="p-1 bg-red-50 rounded">
                                    <TrendingDown size={14} className="text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">-15% Drop</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Math 201 critical</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-amber-400 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attendance</p>
                                <div className="p-1 bg-amber-50 rounded">
                                    <Calendar size={14} className="text-amber-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">{overview.attendance_rate}% Rate</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Below 75% threshold</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assignments</p>
                                <div className="p-1 bg-blue-50 rounded">
                                    <FileText size={14} className="text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">3 Missed</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Due within last 2 weeks</p>
                        </div>
                    </div>

                    {/* Attendance History Chart */}
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
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="classAvg" name="Class Avg" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey="student" name="Student" stroke="#f87171" strokeWidth={3} dot={{ r: 4, fill: '#f87171', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Coding Profile Analysis */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen size={18} className="text-indigo-600" />
                            Coding Profile Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-[350px]">
                                <GlobalRankChart />
                            </div>
                            <div className="h-[350px]">
                                <ScoreDistributionChart />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Recommended Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" />
                            Recommended Actions
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Immediate intervention suggested due to critical risk status.</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setIsCounselingModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2.5 font-medium text-sm">
                                    <Calendar size={18} />
                                    Schedule Counseling
                                </span>
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setIsMentorModalOpen(true)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-all border active:scale-[0.98] ${hasPeerMentor
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-50 hover:bg-blue-100'
                                    }`}
                            >
                                <span className="flex items-center gap-2.5 font-medium text-sm">
                                    <User size={18} />
                                    {hasPeerMentor ? 'Peer Mentor Assigned' : 'Assign Peer Mentor'}
                                </span>
                                {hasPeerMentor ? <CheckCircle size={18} /> : <MoreHorizontal size={18} />}
                            </button>
                            <button
                                onClick={() => setIsEmailModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2.5 font-medium text-sm">
                                    <Mail size={18} />
                                    Email Student
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Assigned Advisor */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <User size={80} />
                        </div>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5">Assigned Advisor</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shadow-sm border-2 border-white">RM</div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Dr. R. Miles</h4>
                                <p className="text-xs text-gray-500 font-medium">Dean of Students</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-5 border-t border-gray-50 flex gap-3">
                            <button className="flex-1 text-xs font-semibold py-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200/50">View Profile</button>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 text-xs font-semibold py-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
