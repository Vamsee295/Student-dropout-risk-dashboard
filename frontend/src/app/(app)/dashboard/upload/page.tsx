"use client";

import { useState } from "react";
import { facultyService } from "@/services/faculty";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Database } from "lucide-react";

export default function UploadDataPage() {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'attendance' | 'marks' | 'assignments'>('attendance');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');
        try {
            await facultyService.uploadData(file, type);
            setStatus('success');
            setMessage(`Successfully uploaded ${type} data.`);
            setFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            setStatus('error');
            setMessage("Failed to upload data. Please check the file format and try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Upload Academic Data</h1>
                <p className="text-gray-500">Import CSV files to update student records and risk models.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

                {/* Data Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Data Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setType('attendance')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === 'attendance' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <UsersIcon className="mb-1" />
                            <span className="text-sm font-medium">Attendance</span>
                        </button>
                        <button
                            onClick={() => setType('marks')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === 'marks' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FileText className="mb-1" size={20} />
                            <span className="text-sm font-medium">Marks</span>
                        </button>
                        <button
                            onClick={() => setType('assignments')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === 'assignments' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Database className="mb-1" size={20} />
                            <span className="text-sm font-medium">Assignments</span>
                        </button>
                    </div>
                </div>

                {/* File Upload Area */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">CSV up to 10MB</p>
                        </div>
                    </div>
                    {file && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <FileText size={16} className="text-gray-500" />
                            <span className="font-medium">{file.name}</span>
                            <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                {status !== 'idle' && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {status === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                        <div>
                            <p className="font-medium">{status === 'success' ? 'Upload Successful' : 'Upload Failed'}</p>
                            <p className="text-sm opacity-90">{message}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Upload Data
                        </>
                    )}
                </button>

            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                    <Database size={16} />
                    CSV Format Guide
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>Attendance:</strong> student_id, course_id, date, status (Present/Absent)</li>
                    <li><strong>Marks:</strong> student_id, course_id, exam_type, marks_obtained, total_marks</li>
                    <li><strong>Assignments:</strong> student_id, assignment_id, submission_date, score</li>
                </ul>
            </div>
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    )
}
