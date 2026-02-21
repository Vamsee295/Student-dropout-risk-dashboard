/**
 * Client-side CSV refinement — async with detailed step progress.
 * Maps raw columns to model schema, fills missing values, handles outliers.
 */

export const REFINED_SCHEMA = [
  "id",
  "name",
  "department",
  "attendance_rate",
  "engagement_score",
  "academic_performance_index",
  "login_gap_days",
  "failure_ratio",
  "financial_risk_flag",
  "commute_risk_score",
  "semester_performance_trend",
] as const;

type RefinedRow = Record<string, string | number | boolean>;

const RAW_TO_REFINED: Record<string, string[]> = {
  id: ["id", "ID", "student_id", "Student_ID", "roll_no", "Roll_No", "enrollment"],
  name: ["name", "Name", "student_name", "Student_Name", "full_name"],
  department: ["department", "Department", "dept", "branch", "Branch"],
  attendance_rate: ["attendance_%", "Attendance_%", "attendance", "Attendance", "attendance_rate"],
  engagement_score: ["engagement_score", "engagement", "Engagement"],
  academic_performance_index: [
    "academic_performance_index", "cgpa", "CGPA", "gpa", "GPA", "academic_index",
  ],
  login_gap_days: ["login_gap_days", "login_gap", "Login_Gap_Days"],
  failure_ratio: ["failure_ratio", "Failure_Ratio", "fail_ratio"],
  financial_risk_flag: ["financial_risk_flag", "financial_risk", "Financial_Risk"],
  commute_risk_score: ["commute_risk_score", "commute_risk", "Commute_Risk_Score"],
  semester_performance_trend: [
    "semester_performance_trend", "Sem2_GPA", "Sem1_GPA", "trend", "performance_trend",
  ],
};

/* ── Progress types ──────────────────────────────────────────────── */

export interface ColumnMapping {
  refined: string;
  raw: string | null;
  matched: boolean;
}

export interface RefineStepData {
  step: number;
  label: string;
  status: "pending" | "running" | "done";
  details?: {
    totalRows?: number;
    totalColumns?: number;
    rawColumns?: string[];
    columnMappings?: ColumnMapping[];
    means?: Record<string, number>;
    missingFilled?: Record<string, number>;
    rowsProcessed?: number;
    totalRowsToProcess?: number;
    outliersCapped?: Record<string, number>;
    iqrBounds?: Record<string, { lo: number; hi: number }>;
    previewRows?: Record<string, string | number | boolean>[];
    outputRowCount?: number;
  };
}

export type RefineProgressCallback = (steps: RefineStepData[]) => void;

export interface RefineSummary {
  totalRows: number;
  mappedColumns: number;
  unmappedColumns: number;
  missingValuesFilled: number;
  outliersCapped: number;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function tick(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function findColumn(row: Record<string, string>, keys: string[]): string | null {
  const lower = Object.keys(row).map((k) => k.toLowerCase().replace(/\s/g, "_"));
  for (const k of keys) {
    const idx = lower.findIndex(
      (l) => l === k.toLowerCase() || l.includes(k.toLowerCase()),
    );
    if (idx >= 0) return Object.keys(row)[idx];
  }
  return null;
}

function parseNum(v: unknown): number {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return isNaN(n) ? NaN : n;
}

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || c === "\n") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function calcEngagement(r: Record<string, string>): number {
  const mid1 = parseNum(r["MID1_Subject1"] ?? r["mid1_subject1"]);
  const mid2 = parseNum(r["MID1_Subject2"] ?? r["mid1_subject2"]);
  const mid3 = parseNum(r["MID1_Subject3"] ?? r["mid1_subject3"]);
  const vals = [mid1, mid2, mid3].filter((n) => !isNaN(n));
  if (vals.length === 0) return NaN;
  return (vals.reduce((a, b) => a + b, 0) / vals.length / 30) * 100;
}

/* ── Step labels ──────────────────────────────────────────────────── */

const STEP_LABELS = [
  "Parsing CSV file",
  "Mapping columns to schema",
  "Computing column statistics",
  "Filling missing values",
  "Building refined rows",
  "Detecting & capping outliers",
  "Generating output CSV",
];

/* ── Main async refine ────────────────────────────────────────────── */

export async function refineCsvAsync(
  csvText: string,
  onProgress: RefineProgressCallback,
): Promise<{ csv: string; summary: RefineSummary }> {
  const steps: RefineStepData[] = STEP_LABELS.map((label, i) => ({
    step: i,
    label,
    status: "pending" as const,
  }));

  const emit = (idx: number, status: "running" | "done", details?: RefineStepData["details"]) => {
    steps[idx] = { ...steps[idx], status, details: { ...steps[idx].details, ...details } };
    onProgress([...steps]);
  };

  /* ── Step 0: Parse CSV ────────────────────────────────────────── */
  emit(0, "running");
  await tick(400);

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    emit(0, "done", { totalRows: 0, totalColumns: 0, rawColumns: [] });
    return { csv: "", summary: { totalRows: 0, mappedColumns: 0, unmappedColumns: 0, missingValuesFilled: 0, outliersCapped: 0 } };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = vals[j] ?? ""; });
    rows.push(row);
  }

  emit(0, "done", { totalRows: rows.length, totalColumns: headers.length, rawColumns: headers });
  await tick(500);

  /* ── Step 1: Map columns ──────────────────────────────────────── */
  emit(1, "running");
  await tick(600);

  const colMap: Record<string, string> = {};
  const first = rows[0] || {};
  const mappings: ColumnMapping[] = [];

  for (const [refined, rawKeys] of Object.entries(RAW_TO_REFINED)) {
    const found = findColumn(first, rawKeys);
    if (found) colMap[refined] = found;
    mappings.push({ refined, raw: found, matched: !!found });
  }

  const mappedCount = mappings.filter((m) => m.matched).length;
  const unmappedCount = mappings.filter((m) => !m.matched).length;

  const METRIC_KEYS = [
    "attendance_rate", "engagement_score", "academic_performance_index",
    "login_gap_days", "failure_ratio", "financial_risk_flag",
    "commute_risk_score", "semester_performance_trend",
  ];
  const metricsMapped = METRIC_KEYS.filter((k) => colMap[k]).length;
  const hasMidCols = headers.some(
    (h) => h.toLowerCase().includes("mid") && h.toLowerCase().includes("subject"),
  );
  const hasSemGpa = headers.some(
    (h) => (h.toLowerCase().includes("sem1") || h.toLowerCase().includes("sem2")) && h.toLowerCase().includes("gpa"),
  );

  if (metricsMapped === 0 && !hasMidCols && !hasSemGpa) {
    emit(1, "done", { columnMappings: mappings });
    const detected = headers.slice(0, 10).join(", ") + (headers.length > 10 ? `, ... (+${headers.length - 10} more)` : "");
    throw new Error(
      `This file doesn't match any student risk records. ` +
      `No attendance, GPA, engagement, or exam-score columns were found. ` +
      `Detected columns: ${detected}. ` +
      `Please try with a different file.`,
    );
  }

  emit(1, "done", { columnMappings: mappings });
  await tick(500);

  /* ── Step 2: Compute statistics ───────────────────────────────── */
  emit(2, "running");
  await tick(500);

  const numericCols = [
    "attendance_rate", "engagement_score", "academic_performance_index",
    "login_gap_days", "failure_ratio", "commute_risk_score", "semester_performance_trend",
  ];
  const means: Record<string, number> = {};
  for (const col of numericCols) {
    const src = colMap[col];
    if (!src) continue;
    const vals = rows.map((r) => parseNum(r[src])).filter((n) => !isNaN(n));
    means[col] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
  }

  emit(2, "done", { means });
  await tick(400);

  /* ── Step 3: Fill missing values ──────────────────────────────── */
  emit(3, "running");
  await tick(400);

  const missingFilled: Record<string, number> = {};
  for (const col of numericCols) {
    const src = colMap[col];
    if (!src) continue;
    let count = 0;
    for (const r of rows) {
      if (r[src] === "" || r[src] === undefined || r[src] === null || isNaN(Number(r[src]))) {
        count++;
      }
    }
    if (count > 0) missingFilled[col] = count;
  }

  let totalMissing = Object.values(missingFilled).reduce((a, b) => a + b, 0);
  emit(3, "done", { missingFilled });
  await tick(400);

  /* ── Step 4: Build refined rows ───────────────────────────────── */
  emit(4, "running");

  const refinedRows: RefinedRow[] = [];
  const batchSize = Math.max(1, Math.ceil(rows.length / 5));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const out: RefinedRow = {};

    out.id = r[colMap.id] ?? String(i + 1);
    out.name = r[colMap.name] ?? "Unknown";
    out.department = r[colMap.department] ?? "CSE";

    const attendance = parseNum(r[colMap.attendance_rate]);
    out.attendance_rate = isNaN(attendance) ? means.attendance_rate ?? 75 : clamp(attendance, 0, 100);

    const engagement = colMap.engagement_score
      ? parseNum(r[colMap.engagement_score])
      : calcEngagement(r);
    out.engagement_score = isNaN(engagement) ? means.engagement_score ?? 70 : clamp(engagement, 0, 100);

    const gpa = parseNum(r[colMap.academic_performance_index] ?? r["CGPA"] ?? r["cgpa"]);
    // Model expects academic_performance_index on ~0-10 scale (GPA).
    // _metric_to_dataframe multiplies by 10 for the model's avg_assignment_score.
    // If raw value looks like a 0-10 GPA, keep it; if 0-100, scale down.
    let gpaVal = isNaN(gpa) ? means.academic_performance_index ?? 6.5 : gpa;
    if (gpaVal > 10) gpaVal = gpaVal / 10;
    out.academic_performance_index = Math.round(clamp(gpaVal, 0, 10) * 1000) / 1000;

    const loginGap = parseNum(r[colMap.login_gap_days]);
    out.login_gap_days = isNaN(loginGap) ? means.login_gap_days ?? 3 : Math.max(0, Math.round(loginGap));

    const failRatio = parseNum(r[colMap.failure_ratio]);
    out.failure_ratio = isNaN(failRatio) ? means.failure_ratio ?? 0.1 : clamp(failRatio, 0, 1);

    // Output as 1/0 integer — Python bool("false") is True, which is a bug
    out.financial_risk_flag = colMap.financial_risk_flag ? (parseBool(r[colMap.financial_risk_flag]) ? 1 : 0) : 0;

    const commute = parseNum(r[colMap.commute_risk_score]);
    out.commute_risk_score = isNaN(commute) ? 1 : Math.max(1, Math.min(4, Math.round(commute)));

    const sem1 = parseNum(r["Sem1_GPA"] ?? r["sem1_gpa"]);
    const sem2 = parseNum(r["Sem2_GPA"] ?? r["sem2_gpa"]);
    const trend = sem1 > 0 ? ((sem2 - sem1) / sem1) * 100 : means.semester_performance_trend ?? 0;
    out.semester_performance_trend = Math.round(clamp(trend, -100, 100) * 100) / 100;

    refinedRows.push(out);

    if ((i + 1) % batchSize === 0 || i === rows.length - 1) {
      emit(4, "running", { rowsProcessed: i + 1, totalRowsToProcess: rows.length });
      await tick(200);
    }
  }

  emit(4, "done", { rowsProcessed: rows.length, totalRowsToProcess: rows.length });
  await tick(400);

  /* ── Step 5: Handle outliers ──────────────────────────────────── */
  emit(5, "running");
  await tick(500);

  const outliersCapped: Record<string, number> = {};
  const iqrBounds: Record<string, { lo: number; hi: number }> = {};
  let totalOutliers = 0;

  for (const col of ["attendance_rate", "engagement_score", "academic_performance_index"]) {
    const vals = refinedRows.map((r) => Number(r[col])).filter((n) => !isNaN(n));
    if (vals.length < 3) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lo = Math.round((q1 - 1.5 * iqr) * 100) / 100;
    const hi = Math.round((q3 + 1.5 * iqr) * 100) / 100;
    iqrBounds[col] = { lo, hi };
    let capped = 0;
    refinedRows.forEach((r) => {
      const v = Number(r[col]);
      if (v < lo) { r[col] = lo; capped++; }
      else if (v > hi) { r[col] = hi; capped++; }
    });
    if (capped > 0) outliersCapped[col] = capped;
    totalOutliers += capped;
  }

  emit(5, "done", { outliersCapped, iqrBounds });
  await tick(400);

  /* ── Step 6: Generate output CSV ──────────────────────────────── */
  emit(6, "running");
  await tick(300);

  const outHeaders = REFINED_SCHEMA.join(",");
  const outRows = refinedRows.map((row) =>
    REFINED_SCHEMA.map((h) => {
      const v = row[h];
      if (typeof v === "string" && (v.includes(",") || v.includes('"')))
        return `"${String(v).replace(/"/g, '""')}"`;
      return String(v);
    }).join(","),
  );

  const csv = [outHeaders, ...outRows].join("\n");
  const previewRows = refinedRows.slice(0, 5);

  emit(6, "done", { previewRows, outputRowCount: refinedRows.length });

  return {
    csv,
    summary: {
      totalRows: refinedRows.length,
      mappedColumns: mappedCount,
      unmappedColumns: unmappedCount,
      missingValuesFilled: totalMissing,
      outliersCapped: totalOutliers,
    },
  };
}

/* ── Legacy synchronous wrapper (kept for compatibility) ──────────── */

export function refineCsv(
  csvText: string,
  onProgress?: (step: string, pct: number) => void,
): string {
  onProgress?.("Parsing CSV...", 5);
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return "";

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = vals[j] ?? ""; });
    rows.push(row);
  }

  onProgress?.("Mapping columns...", 15);
  const colMap: Record<string, string> = {};
  const first = rows[0] || {};
  for (const [refined, rawKeys] of Object.entries(RAW_TO_REFINED)) {
    const found = findColumn(first, rawKeys);
    if (found) colMap[refined] = found;
  }

  onProgress?.("Filling missing values...", 30);
  const numericCols = [
    "attendance_rate", "engagement_score", "academic_performance_index",
    "login_gap_days", "failure_ratio", "commute_risk_score", "semester_performance_trend",
  ];
  const means: Record<string, number> = {};
  for (const col of numericCols) {
    const src = colMap[col];
    if (!src) continue;
    const vals = rows.map((r) => parseNum(r[src])).filter((n) => !isNaN(n));
    means[col] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  onProgress?.("Building refined rows...", 50);
  const refinedRows: RefinedRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const out: RefinedRow = {};
    out.id = r[colMap.id] ?? String(i + 1);
    out.name = r[colMap.name] ?? "Unknown";
    out.department = r[colMap.department] ?? "CSE";
    const attendance = parseNum(r[colMap.attendance_rate]);
    out.attendance_rate = isNaN(attendance) ? means.attendance_rate ?? 75 : clamp(attendance, 0, 100);
    const engagement = colMap.engagement_score ? parseNum(r[colMap.engagement_score]) : calcEngagement(r);
    out.engagement_score = isNaN(engagement) ? means.engagement_score ?? 70 : clamp(engagement, 0, 100);
    const gpa = parseNum(r[colMap.academic_performance_index] ?? r["CGPA"] ?? r["cgpa"]);
    let gpaLegacy = isNaN(gpa) ? means.academic_performance_index ?? 6.5 : gpa;
    if (gpaLegacy > 10) gpaLegacy = gpaLegacy / 10;
    out.academic_performance_index = Math.round(clamp(gpaLegacy, 0, 10) * 1000) / 1000;
    const loginGap = parseNum(r[colMap.login_gap_days]);
    out.login_gap_days = isNaN(loginGap) ? means.login_gap_days ?? 3 : Math.max(0, Math.round(loginGap));
    const failRatio = parseNum(r[colMap.failure_ratio]);
    out.failure_ratio = isNaN(failRatio) ? means.failure_ratio ?? 0.1 : clamp(failRatio, 0, 1);
    out.financial_risk_flag = colMap.financial_risk_flag ? (parseBool(r[colMap.financial_risk_flag]) ? 1 : 0) : 0;
    const commute = parseNum(r[colMap.commute_risk_score]);
    out.commute_risk_score = isNaN(commute) ? 1 : Math.max(1, Math.min(4, Math.round(commute)));
    const sem1 = parseNum(r["Sem1_GPA"] ?? r["sem1_gpa"]);
    const sem2 = parseNum(r["Sem2_GPA"] ?? r["sem2_gpa"]);
    const trend = sem1 > 0 ? ((sem2 - sem1) / sem1) * 100 : means.semester_performance_trend ?? 0;
    out.semester_performance_trend = clamp(trend, -100, 100);
    refinedRows.push(out);
  }

  onProgress?.("Handling outliers...", 75);
  for (const col of ["attendance_rate", "engagement_score", "academic_performance_index"]) {
    const vals = refinedRows.map((r) => Number(r[col])).filter((n) => !isNaN(n));
    if (vals.length < 3) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    refinedRows.forEach((r) => {
      const v = Number(r[col]);
      if (v < lo) r[col] = lo;
      else if (v > hi) r[col] = hi;
    });
  }

  onProgress?.("Generating CSV...", 90);
  const outHeaders = REFINED_SCHEMA.join(",");
  const outRows = refinedRows.map((row) =>
    REFINED_SCHEMA.map((h) => {
      const v = row[h];
      if (typeof v === "string" && (v.includes(",") || v.includes('"')))
        return `"${String(v).replace(/"/g, '""')}"`;
      return String(v);
    }).join(","),
  );
  onProgress?.("Done", 100);
  return [outHeaders, ...outRows].join("\n");
}
