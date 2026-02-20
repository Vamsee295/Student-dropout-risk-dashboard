"use client";

import { RefreshCw, CheckCircle, XCircle, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

export function IntegrationSettings() {
    const router = useRouter();
    const [lmsStatus, setLmsStatus] = useState<'connected' | 'disconnected'>('connected');
    const [syncing, setSyncing] = useState(false);
    const [selectedLMS, setSelectedLMS] = useState('Canvas');
    const [apiKey, setApiKey] = useState('sk_live_51J...');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('app-settings-integration');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.selectedLMS) setSelectedLMS(parsed.selectedLMS);
            } catch {}
        }
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await apiClient.get('/analytics/ml-metrics');
            setLmsStatus('connected');
        } catch {
            setLmsStatus('disconnected');
        } finally {
            setSyncing(false);
        }
    };

    const handleLMSSelect = (lms: string) => {
        setSelectedLMS(lms);
        localStorage.setItem('app-settings-integration', JSON.stringify({ selectedLMS: lms }));
    };

    const handleRegenerate = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const key = 'sk_live_' + Array.from({ length: 24 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setApiKey(key);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            router.push('/dashboard/upload');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Data Integrations</h2>
                <p className="text-sm text-gray-500">
                    Manage connections to LMS and Student Information Systems.
                </p>
            </div>

            <div className="grid gap-6">
                {/* LMS Integration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Learning Management System (LMS)</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${lmsStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {lmsStatus === 'connected' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {lmsStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            {['Canvas', 'Moodle', 'Blackboard', 'Google Classroom'].map((lms) => (
                                <button key={lms} onClick={() => handleLMSSelect(lms)} className={`flex-1 py-3 border rounded-lg text-sm font-semibold transition-colors ${lms === selectedLMS ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    {lms}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">API Key / Access Token</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                                    readOnly
                                />
                                <button onClick={handleRegenerate} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
                                    Regenerate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIS Integration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900">Student Information System (SIS)</h3>
                            <p className="text-xs text-gray-500">Last synced: Today, 09:30 AM</p>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                            {syncing ? "Syncing..." : "Sync Now"}
                        </button>
                    </div>

                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    <div onClick={handleUploadClick} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                            <Upload size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">Upload CSV Data</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                            Drag and drop your SIS export file here key_student_data.csv
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
