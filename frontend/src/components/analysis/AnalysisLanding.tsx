"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileUp,
  FileDown,
  Loader2,
  Download,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  Columns3,
  Calculator,
  Eraser,
  Rows3,
  Shield,
  FileOutput,
  Upload,
  BarChart3,
  Users,
  ChevronLeft,
} from "lucide-react";
import {
  refineCsvAsync,
  type RefineStepData,
  type RefineSummary,
  REFINED_SCHEMA,
} from "@/utils/refineCsv";
import { useAnalysisStore } from "@/store/analysisStore";

/* ── Step icons for refine pipeline ───────────────────────────────── */

const STEP_ICONS = [
  FileSpreadsheet,
  Columns3,
  Calculator,
  Eraser,
  Rows3,
  Shield,
  FileOutput,
];

/* ── Import progress event type ───────────────────────────────────── */

interface ImportEvent {
  type: "progress" | "done" | "error";
  phase?: string;
  message?: string;
  processed?: number;
  total?: number;
  latest_student?: string;
  latest_risk?: string;
  distribution?: Record<string, number>;
  overview?: Record<string, unknown>;
  students?: Record<string, unknown>[];
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Main Component                                                   */
/* ══════════════════════════════════════════════════════════════════ */

export function AnalysisLanding() {
  const [mode, setMode] = useState<"idle" | "refine" | "import">("idle");

  /* ── Refine state ─── */
  const [refineFile, setRefineFile] = useState<File | null>(null);
  const [refineSteps, setRefineSteps] = useState<RefineStepData[]>([]);
  const [refineDone, setRefineDone] = useState(false);
  const [refinedCsv, setRefinedCsv] = useState("");
  const [refineSummary, setRefineSummary] = useState<RefineSummary | null>(null);
  const [refineError, setRefineError] = useState("");

  /* ── Import state ─── */
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importEvents, setImportEvents] = useState<ImportEvent[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importProcessed, setImportProcessed] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importDistribution, setImportDistribution] = useState<Record<string, number>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const setAnalysisData = useAnalysisStore((s) => s.setAnalysisData);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [importEvents]);

  /* ── Refine handlers ────────────────────────────────────────────── */

  const handleRefineClick = () => {
    setMode("refine");
    setRefineFile(null);
    setRefineDone(false);
    setRefinedCsv("");
    setRefineSteps([]);
    setRefineSummary(null);
    setRefineError("");
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleRefineFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRefineFile(f);
    setRefineDone(false);
    setRefinedCsv("");
    setRefineSteps([]);
    setRefineSummary(null);
    setRefineError("");

    try {
      const text = await f.text();
      const result = await refineCsvAsync(text, (steps) => {
        setRefineSteps([...steps]);
      });

      setRefinedCsv(result.csv);
      setRefineSummary(result.summary);
      setRefineDone(true);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Refinement failed");
    }
  };

  const handleDownloadRefined = () => {
    if (!refinedCsv) return;
    const blob = new Blob([refinedCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refined_student_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportRefinedResult = async () => {
    if (!refinedCsv) return;
    const blob = new Blob([refinedCsv], { type: "text/csv" });
    const file = new File([blob], "refined_student_data.csv", { type: "text/csv" });
    setMode("import");
    setImportFile(file);
    await runImport(file);
  };

  /* ── Import handlers ────────────────────────────────────────────── */

  const handleImportClick = () => {
    setMode("import");
    setImportFile(null);
    setImportEvents([]);
    setImportError("");
    setImportProcessed(0);
    setImportTotal(0);
    setImportDistribution({});
    setTimeout(() => importInputRef.current?.click(), 50);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImportFile(f);
    await runImport(f);
  };

  const runImport = async (f: File) => {
    setImporting(true);
    setImportEvents([]);
    setImportError("");
    setImportProcessed(0);
    setImportTotal(0);
    setImportDistribution({});

    try {
      const formData = new FormData();
      formData.append("file", f);

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(`${apiUrl}/analysis/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Import failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj: ImportEvent = JSON.parse(line);
              setImportEvents((p) => [...p, obj]);

              if (obj.type === "progress") {
                if (obj.processed !== undefined) setImportProcessed(obj.processed);
                if (obj.total !== undefined) setImportTotal(obj.total);
                if (obj.distribution) setImportDistribution(obj.distribution);
              } else if (obj.type === "done" && obj.overview && obj.students) {
                setAnalysisData(obj.overview as any, obj.students as any);
              } else if (obj.type === "error") {
                setImportError(obj.message || "Error during import");
              }
            } catch {
              // skip malformed line
            }
          }
        }
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const resetView = () => {
    setMode("idle");
    setRefineFile(null);
    setRefinedCsv("");
    setRefineDone(false);
    setRefineSteps([]);
    setRefineSummary(null);
    setRefineError("");
    setImportFile(null);
    setImportEvents([]);
    setImportError("");
    setImportProcessed(0);
    setImportTotal(0);
    setImportDistribution({});
  };

  /* ══════════════════════════════════════════════════════════════ */
  /*  IDLE VIEW                                                    */
  /* ══════════════════════════════════════════════════════════════ */

  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Start a New Analysis</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            Import any CSV (raw or refined) to run risk analysis, or refine raw data first to preview and download.
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={handleImportClick}
            className="group flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 hover:border-indigo-400 transition-all p-6 hover:shadow-lg hover:shadow-indigo-100"
          >
            <div className="p-4 bg-indigo-100 rounded-2xl group-hover:scale-110 transition-transform">
              <FileUp className="w-10 h-10 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-900">Import CSV</span>
            <span className="text-xs text-gray-500 text-center leading-relaxed">
              Upload any CSV — raw or refined. Columns are auto-mapped if needed
            </span>
          </button>
          <button
            onClick={handleRefineClick}
            className="group flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400 transition-all p-6 hover:shadow-lg hover:shadow-amber-100"
          >
            <div className="p-4 bg-amber-100 rounded-2xl group-hover:scale-110 transition-transform">
              <FileDown className="w-10 h-10 text-amber-600" />
            </div>
            <span className="font-bold text-gray-900">Refine CSV</span>
            <span className="text-xs text-gray-500 text-center leading-relaxed">
              Process raw data — map columns, fill gaps, cap outliers
            </span>
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-lg w-full">
          <p className="text-xs font-semibold text-gray-600 mb-2">Expected Model Schema</p>
          <div className="flex flex-wrap gap-1.5">
            {REFINED_SCHEMA.map((col) => (
              <span key={col} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600">
                {col}
              </span>
            ))}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleRefineFile} />
        <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════ */
  /*  REFINE VIEW — Animated Pipeline                              */
  /* ══════════════════════════════════════════════════════════════ */

  if (mode === "refine") {
    const overallPct = refineSteps.length
      ? Math.round(
          (refineSteps.filter((s) => s.status === "done").length / refineSteps.length) * 100,
        )
      : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={resetView} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg">Refine CSV</h3>
            {refineFile && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-mono">
                {refineFile.name}
              </span>
            )}
          </div>
          {/* Overall progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{refineDone ? "Complete" : "Processing..."}</span>
              <span>{overallPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Steps */}
        {refineSteps.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Processing Pipeline</h4>
            </div>
            <div className="divide-y divide-gray-50">
              {refineSteps.map((step, idx) => {
                const Icon = STEP_ICONS[idx] || Circle;
                return (
                  <div
                    key={idx}
                    className={`px-4 py-3 transition-colors duration-300 ${
                      step.status === "running" ? "bg-amber-50/60" : step.status === "done" ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <div className="flex-shrink-0">
                        {step.status === "done" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : step.status === "running" ? (
                          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      {/* Step label */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          step.status === "done" ? "text-gray-600" : step.status === "running" ? "text-amber-600" : "text-gray-400"
                        }`} />
                        <span className={`text-sm font-medium ${
                          step.status === "done" ? "text-gray-800" : step.status === "running" ? "text-amber-800" : "text-gray-400"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    </div>

                    {/* Step details (only for done or running) */}
                    {step.details && step.status !== "pending" && (
                      <div className="ml-8 mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <StepDetails step={step} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error — irrelevant file */}
        {refineError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">Incompatible File</p>
                <p className="text-sm text-red-700 leading-relaxed">{refineError}</p>
                <button
                  onClick={resetView}
                  className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try a Different File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary + Actions (after completion) */}
        {refineDone && refineSummary && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard label="Rows" value={refineSummary.totalRows} color="indigo" />
              <SummaryCard label="Columns Mapped" value={`${refineSummary.mappedColumns}/${refineSummary.mappedColumns + refineSummary.unmappedColumns}`} color="emerald" />
              <SummaryCard label="Missing Filled" value={refineSummary.missingValuesFilled} color="amber" />
              <SummaryCard label="Outliers Capped" value={refineSummary.outliersCapped} color="red" />
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-900">Refinement Complete</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadRefined}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Download size={18} />
                  Download Refined CSV
                </button>
                <button
                  onClick={handleImportRefinedResult}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <ArrowRight size={18} />
                  Import to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleRefineFile} />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════ */
  /*  IMPORT VIEW — Streaming Progress                             */
  /* ══════════════════════════════════════════════════════════════ */

  if (mode === "import") {
    const pct = importTotal > 0 ? Math.round((importProcessed / importTotal) * 100) : 0;
    const isDone = importEvents.some((e) => e.type === "done");
    const hasDistribution = Object.values(importDistribution).some((v) => v > 0);
    const distTotal = Object.values(importDistribution).reduce((a, b) => a + b, 0) || 1;

    const RISK_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
      "High Risk": { bg: "bg-red-50", bar: "bg-red-500", text: "text-red-700" },
      "Moderate Risk": { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-700" },
      Stable: { bg: "bg-indigo-50", bar: "bg-indigo-500", text: "text-indigo-700" },
      Safe: { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-700" },
    };

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={resetView} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg">Import & Analyze CSV</h3>
            {importFile && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-mono">
                {importFile.name}
              </span>
            )}
          </div>
          {importTotal > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{isDone ? "Analysis complete" : `Processing ${importProcessed} of ${importTotal} students`}</span>
                <span>{isDone ? "100" : pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${isDone ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-indigo-400 to-indigo-500"}`}
                  style={{ width: `${isDone ? 100 : pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live stats cards */}
        {importTotal > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Total Students" value={importTotal} color="indigo" />
            <SummaryCard label="Processed" value={importProcessed} color="emerald" />
            <SummaryCard
              label="High Risk"
              value={importDistribution["High Risk"] || 0}
              color="red"
            />
            <SummaryCard
              label="Safe"
              value={importDistribution["Safe"] || 0}
              color="emerald"
            />
          </div>
        )}

        {/* Live risk distribution bars */}
        {hasDistribution && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Risk Distribution (live)</h4>
            <div className="space-y-2.5">
              {Object.entries(RISK_COLORS).map(([level, colors]) => {
                const count = importDistribution[level] || 0;
                const width = Math.round((count / distTotal) * 100);
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className={`font-medium ${colors.text}`}>{level}</span>
                      <span className="text-gray-500">{count} students</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Processing log */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Processing Log</h4>
            {importing && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
          </div>
          <div className="max-h-56 overflow-y-auto p-4 bg-slate-900 space-y-0.5">
            {importEvents.map((evt, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono leading-5">
                {evt.type === "error" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : evt.type === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="text-slate-600 flex-shrink-0 w-3.5 text-center">›</span>
                )}
                <span className={
                  evt.type === "error" ? "text-red-400" : evt.type === "done" ? "text-emerald-400" : "text-slate-300"
                }>
                  {evt.message}
                </span>
              </div>
            ))}
            {isDone && (
              <div className="flex items-start gap-2 text-xs font-mono leading-5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-emerald-400 font-semibold">Analysis complete — loading dashboard...</span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {importError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">
                {importError.toLowerCase().includes("doesn't match") ? "Incompatible File" : "Import Error"}
              </p>
              <p className="text-sm text-red-700 leading-relaxed">{importError}</p>
              <button
                onClick={resetView}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Try a Different File
              </button>
            </div>
          </div>
        )}

        <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
      </div>
    );
  }

  return null;
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Sub-components                                                   */
/* ══════════════════════════════════════════════════════════════════ */

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    red: "bg-red-50 border-red-100 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.indigo}`}>
      <p className="text-[10px] uppercase font-semibold tracking-wider opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

function StepDetails({ step }: { step: RefineStepData }) {
  const d = step.details;
  if (!d) return null;

  return (
    <div className="text-xs text-gray-600 space-y-2">
      {/* Step 0: Parse */}
      {d.totalRows !== undefined && d.totalColumns !== undefined && (
        <div className="flex items-center gap-4">
          <span className="bg-gray-100 px-2 py-0.5 rounded font-semibold">{d.totalRows} rows</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded font-semibold">{d.totalColumns} columns</span>
        </div>
      )}
      {d.rawColumns && d.rawColumns.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {d.rawColumns.slice(0, 12).map((c) => (
            <span key={c} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">
              {c}
            </span>
          ))}
          {d.rawColumns.length > 12 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{d.rawColumns.length - 12} more</span>
          )}
        </div>
      )}

      {/* Step 1: Column mappings */}
      {d.columnMappings && (
        <div className="grid grid-cols-1 gap-0.5">
          {d.columnMappings.map((m) => (
            <div key={m.refined} className="flex items-center gap-2">
              {m.matched ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              <span className="font-mono text-[10px]">
                {m.matched ? (
                  <><span className="text-gray-500">{m.raw}</span> <span className="text-gray-400 mx-0.5">&rarr;</span> <span className="font-semibold text-gray-700">{m.refined}</span></>
                ) : (
                  <span className="text-amber-600">{m.refined} (no match — will use defaults)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Means / stats */}
      {d.means && Object.keys(d.means).length > 0 && (
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(d.means).map(([col, val]) => (
            <div key={col} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <span className="font-mono text-[10px] text-gray-500 truncate">{col}</span>
              <span className="font-mono text-[10px] font-bold text-gray-700 ml-1">{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Missing values filled */}
      {d.missingFilled && Object.keys(d.missingFilled).length > 0 && (
        <div className="space-y-0.5">
          {Object.entries(d.missingFilled).map(([col, count]) => (
            <div key={col} className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-gray-500">{col}</span>
              <span className="font-mono text-[10px] text-amber-600 font-bold">{count} values filled</span>
            </div>
          ))}
        </div>
      )}
      {d.missingFilled && Object.keys(d.missingFilled).length === 0 && step.status === "done" && (
        <span className="text-emerald-600 text-[11px]">No missing values found</span>
      )}

      {/* Step 4: Rows processed */}
      {d.rowsProcessed !== undefined && d.totalRowsToProcess !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span>{d.rowsProcessed} / {d.totalRowsToProcess} rows</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((d.rowsProcessed / d.totalRowsToProcess) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 5: Outliers */}
      {d.outliersCapped && d.iqrBounds && (
        <div className="space-y-1">
          {Object.entries(d.iqrBounds).map(([col, bounds]) => (
            <div key={col} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <span className="font-mono text-[10px] text-gray-500">{col}</span>
              <span className="text-[10px]">
                <span className="text-gray-400">IQR bounds</span>{" "}
                <span className="font-bold text-gray-700">[{bounds.lo}, {bounds.hi}]</span>
                {d.outliersCapped![col] ? (
                  <span className="ml-1.5 text-red-600 font-bold">{d.outliersCapped![col]} capped</span>
                ) : (
                  <span className="ml-1.5 text-emerald-600">0 capped</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 6: Preview table */}
      {d.previewRows && d.previewRows.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Preview (first {d.previewRows.length} rows)</p>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-50">
                  {REFINED_SCHEMA.slice(0, 7).map((h) => (
                    <th key={h} className="px-2 py-1 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.previewRows.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {REFINED_SCHEMA.slice(0, 7).map((h) => (
                      <td key={h} className="px-2 py-1 text-gray-700 font-mono whitespace-nowrap">
                        {typeof row[h] === "number" ? (row[h] as number).toFixed?.(2) ?? row[h] : String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {d.outputRowCount && (
            <p className="text-[10px] text-gray-400 mt-1">{d.outputRowCount} total rows in output</p>
          )}
        </div>
      )}
    </div>
  );
}
