const courseBands = [
  { label: "Low Risk Courses", value: 62 },
  { label: "Watchlist Courses", value: 23 },
  { label: "High Risk Courses", value: 15 },
];

export default function CourseInsightsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            Course & Subject Performance
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Analyze dropout risk and attendance trends across all academic
            courses.
          </p>
        </div>
        <button className="pill-button pill-button--outline text-[11px]">
          Export Summary
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Institutional Avg Risk
          </div>
          <div className="mt-2 text-2xl font-bold">12.4%</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            -1.2% vs last semester
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Students in High-Risk Courses
          </div>
          <div className="mt-2 text-2xl font-bold">145</div>
          <div className="mt-1 text-[11px] font-semibold text-red-500">
            +5 compared to last term
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Courses Above Risk Threshold
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">3</div>
          <p className="mt-1 text-[11px] text-neutral-600">
            Require immediate academic attention.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h3 className="text-sm font-bold tracking-tight">
            Course Risk Distribution
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Number of courses falling into each dropout risk band.
          </p>
          <div className="mt-4 flex h-40 items-end justify-between gap-3">
            {[60, 45, 30].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-md bg-sky-400"
                  style={{ height: `${value + 20}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-500">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        <div className="card-surface p-4">
          <h3 className="text-sm font-bold tracking-tight">
            Top At-Risk Courses
          </h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Courses with dropout risk significantly above institutional average.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-100 bg-white text-xs font-semibold">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr] bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
              <span>Course</span>
              <span className="text-right">Risk</span>
              <span className="text-right">Attendance</span>
              <span className="text-right">Avg Grade</span>
            </div>
            <div className="divide-y divide-neutral-100">
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] px-3 py-2">
                <div>
                  <div className="text-sm font-bold">
                    Intro to Macroeconomics
                  </div>
                  <div className="text-[11px] text-neutral-600">
                    ECON 101 · Prof. Sarah Jenkins
                  </div>
                </div>
                <span className="text-right text-red-600">24%</span>
                <span className="text-right">61%</span>
                <span className="text-right">C+</span>
              </div>
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] px-3 py-2">
                <div>
                  <div className="text-sm font-bold">Computer Science 101</div>
                  <div className="text-[11px] text-neutral-600">
                    CS 101 · Prof. Alan Turing
                  </div>
                </div>
                <span className="text-right text-red-600">21%</span>
                <span className="text-right">64%</span>
                <span className="text-right">B-</span>
              </div>
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] px-3 py-2">
                <div>
                  <div className="text-sm font-bold">Linear Algebra</div>
                  <div className="text-[11px] text-neutral-600">
                    MATH 201 · Prof. John Doe
                  </div>
                </div>
                <span className="text-right text-amber-700">16%</span>
                <span className="text-right">72%</span>
                <span className="text-right">B</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

