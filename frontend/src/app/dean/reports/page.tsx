"use client";

import { useState } from "react";
import { deanService } from "@/services/dean";
import { Download, Loader2, FileText, CheckCircle2 } from "lucide-react";

export default function DeanReports() {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const convertToCSV = (data: any) => {
        if (!data) return "";
        const dataToConvert = Array.isArray(data) ? data : [data];
        if (dataToConvert.length === 0) return "";

        const headers = Object.keys(dataToConvert[0]);
        const rows = dataToConvert.map(obj =>
            headers.map(header => {
                let val = obj[header];
                if (typeof val === 'object' && val !== null) val = JSON.stringify(val).replace(/"/g, '""');
                if (val === null || val === undefined) val = "";
                const valStr = String(val);
                return valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')
                    ? `"${valStr.replace(/"/g, '""')}"`
                    : valStr;
            }).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    };

    const handleExport = async (type: string) => {
        setLoading(true);
        setSuccessMsg("");
        try {
            const data = await deanService.getReportsSummary();
            const csvContent = convertToCSV(data);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dean_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setSuccessMsg(`Successfully exported ${type} report as CSV.`);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
                <p className="text-sm text-gray-500 mt-1">Download raw institutional data and aggregated summaries for compliance and review.</p>
            </div>

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 size={18} />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card 1 */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="text-violet-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Executive Summary</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6 h-10">High-level aggregates including total enrollment, risk distributions, and institutional GPA averages.</p>
                    <button
                        onClick={() => handleExport("executive_summary")}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Download Report (CSV)
                    </button>
                </div>

                {/* Export Card 2 */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="text-blue-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Departmental Breakdown</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6 h-10">Row-level data for all departments, faculty mapping, and specific risk matrices.</p>
                    <button
                        onClick={() => handleExport("department_data")}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <Download size={18} className="text-gray-500" />}
                        Download Report (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
}
