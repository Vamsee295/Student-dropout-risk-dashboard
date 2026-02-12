"use client";

import { X, Search, User } from "lucide-react";
import { useState } from "react";
import { TEACHERS } from "@/data/mockStudentData";

interface AssignFacultyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (teacherName: string) => void;
    studentName: string;
}

export function AssignFacultyModal({ isOpen, onClose, onConfirm, studentName }: AssignFacultyModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredTeachers = TEACHERS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = () => {
        if (selectedTeacherId) {
            const teacher = TEACHERS.find(t => t.id === selectedTeacherId);
            if (teacher) {
                onConfirm(teacher.name);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Assign Faculty</h2>
                        <p className="text-xs text-gray-500">Select a faculty member for {studentName}</p>
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
                            placeholder="Search faculty..."
                            className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredTeachers.map((teacher) => (
                            <button
                                key={teacher.id}
                                onClick={() => setSelectedTeacherId(teacher.id)}
                                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${selectedTeacherId === teacher.id
                                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                                        : "border-gray-100 hover:bg-gray-50"
                                    }`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedTeacherId === teacher.id ? "bg-emerald-200 text-emerald-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                    <User size={18} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{teacher.name}</div>
                                    <div className="text-xs text-gray-500">{teacher.department}</div>
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
                        disabled={!selectedTeacherId}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}
