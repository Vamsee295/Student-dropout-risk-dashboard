"use client";

import { X, Search, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { InterventionCardProps } from "./InterventionCard";

interface NewInterventionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (intervention: Partial<InterventionCardProps>) => void;
    initialData?: {
        studentName?: string;
        riskLevel?: string;
        studentId?: string;
    };
}

export function NewInterventionModal({ isOpen, onClose, onConfirm, initialData }: NewInterventionModalProps) {
    const [studentName, setStudentName] = useState("");
    const [riskLevel, setRiskLevel] = useState("High Risk");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [action, setAction] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setStudentName(initialData.studentName || "");
                setRiskLevel(initialData.riskLevel || "High Risk");
            } else {
                // Reset if opening without data (for manual "New Intervention" button)
                setStudentName("");
                setRiskLevel("High Risk");
                setTitle("");
                setDescription("");
                setAction("");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (studentName && title && description) {
            const newIntervention: Partial<InterventionCardProps> = {
                studentName,
                studentInitial: studentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
                studentId: initialData?.studentId || `#${Math.floor(Math.random() * 9000) + 1000}`,
                grade: "Grade 11", // Mock Grade
                riskLevel: riskLevel as any,
                alertTitle: title,
                alertDescription: description,
                suggestedAction: action || "Review Student Profile",
                status: "Pending",
            };
            onConfirm(newIntervention);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New Intervention</h2>
                        <p className="text-xs text-gray-500">Manually flag a student for support.</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Student Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Student Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search or enter student name..."
                                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Risk Severity</label>
                        <select
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={riskLevel}
                            onChange={(e) => setRiskLevel(e.target.value)}
                        >
                            <option value="High Risk">High Risk</option>
                            <option value="Medium Risk">Medium Risk</option>
                            <option value="Low Risk">Low Risk</option>
                        </select>
                    </div>

                    {/* Alert Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Alert Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Sudden grade drop in Math"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            placeholder="Describe the issue..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Suggested Action */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Suggested Action</label>
                        <input
                            type="text"
                            placeholder="e.g. Schedule Counseling"
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!studentName || !title || !description}
                        className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <AlertTriangle size={16} />
                        Create Intervention
                    </button>
                </div>
            </div>
        </div>
    );
}
