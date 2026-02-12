"use client";

import { Calendar, UserPlus, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { CounselingModal } from "./CounselingModal";
import { AssignMentorModal } from "./AssignMentorModal";
import { EmailStudentModal } from "./EmailStudentModal";
import { SuccessAnimation } from "@/components/interventions/SuccessAnimation";

export function RecommendedActions() {
    // Modal State
    const [isCounselingOpen, setIsCounselingOpen] = useState(false);
    const [isMentorOpen, setIsMentorOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);

    // Success Animation State
    const [successData, setSuccessData] = useState<{ visible: boolean; message: string; sub: string }>({
        visible: false, message: "", sub: ""
    });

    // Handlers
    const handleCounselingConfirm = (date: string, time: string, type: string) => {
        setSuccessData({
            visible: true,
            message: "Session Scheduled!",
            sub: `${type} set for ${date} at ${time}.`
        });
    };

    const handleMentorConfirm = (mentorName: string) => {
        setSuccessData({
            visible: true,
            message: "Mentor Assigned!",
            sub: `${mentorName} has been assigned as a peer mentor.`
        });
    };

    const handleEmailConfirm = () => {
        setSuccessData({
            visible: true,
            message: "Email Sent!",
            sub: "Your message has been sent to the student."
        });
    };

    return (
        <div className="flex flex-col gap-6 h-full relative">
            {/* Success Animation Overlay */}
            {successData.visible && (
                <SuccessAnimation
                    message={successData.message}
                    subMessage={successData.sub}
                    onComplete={() => setSuccessData({ visible: false, message: "", sub: "" })}
                />
            )}

            {/* Recommended Actions */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <span className="text-lg">⚡</span>
                    <h3 className="font-bold text-gray-900">Recommended Actions</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-6">
                    Immediate intervention suggested due to critical risk status.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => setIsCounselingOpen(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={18} />
                            <span>Schedule Counseling</span>
                        </div>
                        <span>→</span>
                    </button>

                    <button
                        onClick={() => setIsMentorOpen(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"
                    >
                        <div className="flex items-center gap-3">
                            <UserPlus size={18} />
                            <span>Assign Peer Mentor</span>
                        </div>
                        <span>+</span>
                    </button>

                    <button
                        onClick={() => setIsEmailOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                    >
                        <Mail size={18} />
                        <span>Email Student</span>
                    </button>
                </div>
            </div>

            {/* Assigned Advisor */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">Assigned Advisor</h4>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                            {/* Mock Advisor Image */}
                            <img src="https://ui-avatars.com/api/?name=Sarah+Connor&background=random" alt="Sarah Connor" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Sarah Connor</h4>
                            <button className="text-xs font-semibold text-blue-600 hover:underline">View Notes</button>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MessageSquare size={20} />
                    </button>
                </div>
            </div>

            {/* Next 7 Days (Mock) */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Next 7 Days</h4>
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[50px]">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Nov</span>
                        <span className="text-xl font-bold text-gray-900">12</span>
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-gray-900">Data Structures Quiz</h5>
                        <p className="text-xs text-gray-500">CS-201 • 10:00 AM</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CounselingModal
                isOpen={isCounselingOpen}
                onClose={() => setIsCounselingOpen(false)}
                onConfirm={handleCounselingConfirm}
            />

            <AssignMentorModal
                isOpen={isMentorOpen}
                onClose={() => setIsMentorOpen(false)}
                onConfirm={handleMentorConfirm}
            />

            <EmailStudentModal
                isOpen={isEmailOpen}
                onClose={() => setIsEmailOpen(false)}
                onConfirm={handleEmailConfirm}
            />
        </div>
    );
}
