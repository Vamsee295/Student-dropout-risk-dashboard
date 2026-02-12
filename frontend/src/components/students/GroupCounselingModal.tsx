"use client";

import { X, Calendar, Clock, Users } from "lucide-react";
import { useState } from "react";

interface GroupCounselingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (topic: string, date: string, time: string) => void;
    studentCount: number;
}

export function GroupCounselingModal({ isOpen, onClose, onConfirm, studentCount }: GroupCounselingModalProps) {
    const [topic, setTopic] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (topic && date && time) {
            onConfirm(topic, date, time);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Schedule Group Counseling</h2>
                        <p className="text-xs text-gray-500">Scheduling session for {studentCount} students</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="rounded-lg bg-blue-50 p-3 flex items-start gap-3">
                        <Users className="text-blue-600 mt-1" size={18} />
                        <div className="text-sm text-blue-900">
                            You are about to schedule a group session for <span className="font-bold">{studentCount} selected students</span>.
                            They will all receive an email invitation.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Session Topic</label>
                        <input
                            type="text"
                            placeholder="e.g. Academic Performance Review"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="time"
                                    className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!topic || !date || !time}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Schedule Session
                    </button>
                </div>
            </div>
        </div>
    );
}
