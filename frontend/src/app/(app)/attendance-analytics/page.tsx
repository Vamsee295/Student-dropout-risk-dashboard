const attendanceDrivers = [
  { label: "Overall Attendance Rate", value: 0.88 },
  { label: "Consecutive Absence Days", value: 0.81 },
  { label: "First-Period Presence", value: 0.72 },
  { label: "Lab / Practical Attendance", value: 0.64 },
  { label: "Tutorial Session Attendance", value: 0.53 },
];

export default function AttendanceAnalyticsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            Attendance Risk Insights
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Detailed breakdown of attendance patterns and how they drive dropout
            risk for the current semester.
          </p>
        </div>
        <button className="pill-button pill-button--outline text-[11px]">
          Last 30 Days ▾
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Avg Institutional Attendance
          </div>
          <div className="mt-2 text-2xl font-bold">87%</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            +1.2% vs last semester
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100">
            <div className="h-1.5 w-[87%] rounded-full bg-sky-500" />
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Students Below 75% Threshold
          </div>
          <div className="mt-2 text-2xl font-bold">214</div>
          <div className="mt-1 text-[11px] font-semibold text-amber-700">
            Require attendance improvement plan
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Chronic Absentees (3+ Days)
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">145</div>
          <div className="mt-1 text-[11px] font-semibold text-red-500">
            Prioritized for counselor outreach
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h3 className="text-sm font-bold tracking-tight">
            Attendance Drivers
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Key attendance metrics contributing to dropout risk scoring.
          </p>
          <div className="mt-4 space-y-3 text-xs font-semibold">
            {attendanceDrivers.map((driver) => (
              <div key={driver.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{driver.label}</span>
                  <span className="text-neutral-500">
                    {driver.value.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${driver.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <h3 className="text-sm font-bold tracking-tight">
            Absence Risk Distribution
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Spread of students across absence risk bands based on recent
            attendance history.
          </p>
          <div className="mt-4 flex h-40 items-end justify-between gap-3">
            {[18, 26, 32, 24, 14].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-md bg-sky-400"
                  style={{ height: `${value + 25}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-500">
            <span>0–1 day</span>
            <span>2–3 days</span>
            <span>4–5 days</span>
            <span>6–7 days</span>
            <span>7+ days</span>
          </div>
        </div>
      </section>
    </div>
  );
}

