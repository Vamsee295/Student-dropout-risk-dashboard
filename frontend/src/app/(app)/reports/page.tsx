export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">Reports</h2>
          <p className="text-xs font-medium text-neutral-500">
            Generate semester-level summaries for leadership and accreditation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
            Export CSV
          </button>
          <button className="rounded-full bg-black px-3 py-1.5 text-white">
            Download PDF
          </button>
        </div>
      </section>

      <section className="card-surface p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>Term:</span>
            <button className="rounded-full bg-black px-3 py-1 text-white">
              Fall 2025
            </button>
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1">
              Spring 2026
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Department:</span>
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1">
              All Departments
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-xs font-semibold">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Institutional Risk Overview
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-neutral-700">
              <li>Overall dropout risk: 11.8%</li>
              <li>High-risk students: 128</li>
              <li>Avg engagement score: 7.2 / 10</li>
            </ul>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Attendance Summary
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-neutral-700">
              <li>Average attendance: 87%</li>
              <li>Students below 75%: 214</li>
              <li>Chronic absenteeism: 145</li>
            </ul>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Intervention Effectiveness
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-neutral-700">
              <li>Interventions completed: 62</li>
              <li>Improved risk status: 48 students</li>
              <li>No response: 9 students</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

