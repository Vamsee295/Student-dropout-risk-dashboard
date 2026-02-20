"use client";

import { useState, useCallback } from "react";
import {
    Upload, FileText, CheckCircle, AlertCircle, Loader2, Database,
    Users, BookOpen, ClipboardList, X
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type DataType = "attendance" | "marks" | "assignments";

const DATA_TYPES: { id: DataType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: "attendance",
        label: "Attendance",
        icon: <Users size={22} />,
        description: "student_id, date, status (Present/Absent)",
    },
    {
        id: "marks",
        label: "Marks",
        icon: <BookOpen size={22} />,
        description: "student_id, marks_obtained, max_marks",
    },
    {
        id: "assignments",
        label: "Assignments",
        icon: <ClipboardList size={22} />,
        description: "student_id, submitted (True/False)",
    },
];

export default function UploadDataPage() {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<DataType>("attendance");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{
        status: "success" | "error";
        message: string;
        detail?: string;
        inserted?: number;
        skipped?: number;
    } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (f: File | null) => {
        if (!f) return;
        setFile(f);
        setResult(null);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileChange(droppedFile);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/faculty/upload/${type}`, {
                method: "POST",
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const json = await res.json();

            if (!res.ok) {
                setResult({
                    status: "error",
                    message: "Upload failed",
                    detail: json.detail || json.message || `Server error ${res.status}`,
                });
                return;
            }

            setResult({
                status: "success",
                message: json.message || "Upload successful!",
                inserted: json.inserted,
                skipped: json.skipped_unknown_students,
            });
            setFile(null);
        } catch (err: any) {
            setResult({
                status: "error",
                message: "Network error",
                detail: err.message || "Could not reach the server.",
            });
        } finally {
            setUploading(false);
        }
    };

    const selectedType = DATA_TYPES.find((d) => d.id === type)!;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Upload Academic Data</h1>
                <p className="text-gray-500 mt-1">
                    Import CSV or Excel files to update student records and risk models.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">

                {/* Data Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Data Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DATA_TYPES.map((dt) => (
                            <button
                                key={dt.id}
                                onClick={() => { setType(dt.id); setResult(null); }}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === dt.id
                                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                            >
                                <span className="mb-1.5">{dt.icon}</span>
                                <span className="text-sm font-semibold">{dt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Drag-and-drop File Zone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload File
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            (.csv, .xlsx, .xls — up to 20 MB)
                        </span>
                    </label>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${dragOver
                                ? "border-indigo-400 bg-indigo-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                            }`}
                    >
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-indigo-600">Click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">or drag and drop your file here</p>
                    </div>

                    {file && (
                        <div className="mt-3 flex items-center justify-between gap-2 text-sm text-gray-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-indigo-500 flex-shrink-0" />
                                <span className="font-medium truncate">{file.name}</span>
                                <span className="text-gray-400 text-xs flex-shrink-0">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <button
                                onClick={() => { setFile(null); setResult(null); }}
                                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Result Banner */}
                {result && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${result.status === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                        {result.status === "success"
                            ? <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                            : <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                        }
                        <div>
                            <p className="font-semibold">{result.message}</p>
                            {result.status === "success" && (
                                <p className="text-sm mt-0.5">
                                    {result.inserted} records imported
                                    {result.skipped ? `, ${result.skipped} rows skipped (unknown student ID)` : ""}.
                                    Risk scores will update automatically.
                                </p>
                            )}
                            {result.detail && (
                                <p className="text-sm mt-1 font-mono bg-red-100 p-2 rounded">
                                    {result.detail}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full flex justify-center items-center gap-2 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Uploading & Processing...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Upload {selectedType.label} Data
                        </>
                    )}
                </button>
            </div>

            {/* Format Guide */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
                    <Database size={16} />
                    File Format Guide
                </h4>
                <div className="space-y-3">
                    {DATA_TYPES.map((dt) => (
                        <div key={dt.id} className={`rounded-lg p-3 ${type === dt.id ? "bg-white border border-blue-200" : ""}`}>
                            <p className="text-sm text-blue-900">
                                <strong>{dt.label}:</strong>{" "}
                                <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">{dt.description}</code>
                            </p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-blue-600 mt-3">
                    ✓ Accepts both <strong>CSV</strong> (.csv) and <strong>Excel</strong> (.xlsx / .xls) files.
                    The first row must be the column headers. Student IDs must exist in the system.
                </p>
            </div>
        </div>
    );
}
