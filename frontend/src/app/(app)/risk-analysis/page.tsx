const features = [
  { name: "Attendance Rate", importance: 0.85 },
  { name: "Mid-term Grades", importance: 0.72 },
  { name: "LMS Logins", importance: 0.64 },
  { name: "Financial Aid Status", importance: 0.45 },
  { name: "Commute Distance", importance: 0.2 },
];

export default function RiskAnalysisPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            ML Risk Analysis Insights
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Breakdown of predictive model performance and key risk drivers.
          </p>
        </div>
        <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
          Run New Analysis
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Model Accuracy
          </div>
          <div className="mt-2 text-2xl font-bold">94%</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            +2% vs last version
          </div>
          <p className="mt-2 text-[11px] text-neutral-600">
            Based on validation set of 500 records.
          </p>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Students Analyzed
          </div>
          <div className="mt-2 text-2xl font-bold">2,450</div>
          <p className="mt-2 text-[11px] text-neutral-600">
            Across 12 different departments.
          </p>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            High Risk Alerts
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">128</div>
          <div className="mt-1 text-[11px] font-semibold text-red-500">
            +15 new since last week
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold text-neutral-500">
            Model Type
          </div>
          <div className="mt-2 text-sm font-bold text-neutral-900">
            Gradient Boosted Trees
          </div>
          <p className="mt-2 text-[11px] text-neutral-600">
            Predicts Low / Medium / High dropout risk.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h3 className="text-sm font-bold tracking-tight">Feature Importance</h3>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Top variables influencing dropout predictions.
          </p>
          <div className="mt-3 space-y-3">
            {features.map((feature) => (
              <div key={feature.name} className="space-y-1 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span>{feature.name}</span>
                  <span className="text-neutral-500">
                    {feature.importance.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Risk Probability Distribution
              </h3>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                Student population spread by dropout risk score.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-200" />
                Low
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                High
              </span>
            </div>
          </div>

          <div className="mt-4 flex h-40 items-end justify-between gap-3">
            {[80, 70, 55, 40, 25].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex w-full items-end justify-center rounded-t-md bg-gradient-to-t from-sky-500 to-sky-200"
                  style={{ height: `${value}%` }}
                >
                  <span className="mb-1 text-[10px] font-semibold text-white">
                    {value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-500">
            <span>0–20%</span>
            <span>20–40%</span>
            <span>40–60%</span>
            <span>60–80%</span>
            <span>80–100%</span>
          </div>
        </div>
      </section>
    </div>
  );
}

