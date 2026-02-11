const weeks = [
  "Week 1",
  "Week 2",
  "Week 3",
  "Week 4",
  "Week 5",
  "Week 6",
  "Week 7",
];

export default function EngagementMetricsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            Student Engagement Overview
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Track digital participation and identify at-risk students based on
            LMS activity.
          </p>
        </div>
        <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
          Export Report
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Avg Login Rate
          </div>
          <div className="mt-2 text-2xl font-bold">84%</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            +5% vs previous 30 days
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Avg Time Spent
          </div>
          <div className="mt-2 text-2xl font-bold">4.2 h</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            +1.2 h per student / week
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Assignment Completion
          </div>
          <div className="mt-2 text-2xl font-bold">92%</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            +3% submission rate
          </div>
        </div>
      </section>

      <section className="card-surface p-4 space-y-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight">
            Digital Footprint (LMS Logins)
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Each square represents a student login on that day.
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1 rounded-lg bg-neutral-50 p-3">
          {weeks.map((week) =>
            Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`${week}-${index}`}
                className="h-4 w-4 rounded-[4px] bg-sky-100"
              />
            )),
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
          <span>Less active</span>
          <span>More active</span>
        </div>
      </section>
    </div>
  );
}

