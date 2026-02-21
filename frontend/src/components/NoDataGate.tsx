"use client";

import { useAnalysisStore } from "@/store/analysisStore";
import { Upload, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

interface NoDataGateProps {
  children: React.ReactNode;
}

export function NoDataGate({ children }: NoDataGateProps) {
  const hasData = useAnalysisStore((s) => s.hasData);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-indigo-50 rounded-2xl mb-6">
          <FileSpreadsheet size={48} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Analysis Data</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Import a CSV file to populate the dashboard with student risk analysis.
          All data is session-based and lives in your browser until you start a new analysis.
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
        >
          <Upload size={18} />
          Import CSV
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
