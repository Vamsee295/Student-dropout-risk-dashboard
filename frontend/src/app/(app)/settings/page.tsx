export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">Admin Settings</h2>
          <p className="text-xs font-medium text-neutral-500">
            Configure thresholds, engagement score weights, and notification
            rules for the dashboard.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-surface p-4 space-y-3 text-xs font-semibold">
          <h3 className="text-sm font-bold tracking-tight">
            Engagement Score Weights
          </h3>
          <p className="text-[11px] font-medium text-neutral-500">
            Conceptual configuration for how engagement score is calculated.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Attendance</span>
              <span>30%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>LMS Logins</span>
              <span>25%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Assignment Completion</span>
              <span>25%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Quiz Performance</span>
              <span>20%</span>
            </li>
          </ul>
        </div>

        <div className="card-surface p-4 space-y-3 text-xs font-semibold">
          <h3 className="text-sm font-bold tracking-tight">
            Risk Level Thresholds
          </h3>
          <p className="text-[11px] font-medium text-neutral-500">
            Sample thresholds based on predicted dropout probability.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Low Risk</span>
              <span className="text-emerald-600">&lt; 0.50</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Medium Risk</span>
              <span className="text-amber-700">0.50 – 0.79</span>
            </li>
            <li className="flex items-center justify-between">
              <span>High Risk</span>
              <span className="text-red-600">&ge; 0.80</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

