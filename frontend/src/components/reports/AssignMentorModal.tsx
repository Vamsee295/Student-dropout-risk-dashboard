"use client";

import { X, Search, GraduationCap } from "lucide-react";
import { useState } from "react";
import { PEER_MENTORS } from "@/data/mockStudentData";

interface AssignMentorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mentorName: string) => void;
}

export function AssignMentorModal({ isOpen, onClose, onConfirm }: AssignMentorModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredMentors = PEER_MENTORS.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = () => {
        if (selectedMentorId) {
            const mentor = PEER_MENTORS.find(m => m.id === selectedMentorId);
            if (mentor) {
                onConfirm(mentor.name);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Assign Peer Mentor</h2>
                        <p className="text-xs text-gray-500">Select a senior student to mentor.</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search mentors..."
                            className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredMentors.map((mentor) => (
                            <button
                                key={mentor.id}
                                onClick={() => setSelectedMentorId(mentor.id)}
                                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${selectedMentorId === mentor.id
                                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                                        : "border-gray-100 hover:bg-gray-50"
                                    }`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedMentorId === mentor.id ? "bg-emerald-200 text-emerald-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                    <GraduationCap size={18} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{mentor.name}</div>
                                    <div className="text-xs text-gray-500">{mentor.department} • {mentor.year}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedMentorId}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Assign Mentor
                    </button>
                </div>
            </div>
        </div>
    );
}
