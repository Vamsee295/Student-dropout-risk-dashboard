"use client";

import { X, Send } from "lucide-react";
import { useState } from "react";

interface EmailStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function EmailStudentModal({ isOpen, onClose, onConfirm }: EmailStudentModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (subject && message) {
            onConfirm();
            onClose();
            // Reset for next time
            setSubject("");
            setMessage("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Email Student</h2>
                        <p className="text-xs text-gray-500">Send a direct message to their student email.</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. Schedule a meeting regarding your recent grades"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            placeholder="Write your message here..."
                            rows={6}
                            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!subject || !message}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        Send Email
                    </button>
                </div>
            </div>
        </div>
    );
}
