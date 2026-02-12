"use client";

import Link from "next/link";

interface InterventionItemProps {
    label: string;
    percentage: number;
    color: string;
}

function InterventionItem({ label, percentage, color }: InterventionItemProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-700">{label}</span>
                <span className="text-blue-600">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

export function InterventionStatus() {
    const handleDownloadReport = () => {
        // Mock CSV Download
        const rows = [
            ["Intervention Type", "Completion Percentage", "Status"],
            ["Counseling Scheduled", "85%", "On Track"],
            ["Parent Meetings", "42%", "Delayed"],
            ["Academic Tutoring", "92%", "Completed"]
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "intervention_status_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Intervention Status</h3>
                <button
                    onClick={handleDownloadReport}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                >
                    Download Report
                </button>
            </div>

            <div className="space-y-6">
                <InterventionItem
                    label="Counseling Scheduled"
                    percentage={85}
                    color="#3b82f6" // blue-500
                />
                <InterventionItem
                    label="Parent Meetings"
                    percentage={42}
                    color="#f59e0b" // amber-500
                />
                <InterventionItem
                    label="Academic Tutoring"
                    percentage={92}
                    color="#10b981" // emerald-500
                />
            </div>

            <Link
                href="/interventions"
                className="mt-6 block w-full rounded-lg bg-blue-50 py-2.5 text-center text-sm font-bold text-blue-600 hover:bg-blue-100"
            >
                View Full Intervention Board
            </Link>
        </div>
    );
}
