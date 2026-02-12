const alerts = [
  {
    title: "Attendance dropped below 60%",
    description: "34 students crossed the attendance risk threshold this week.",
    type: "Critical",
  },
  {
    title: "No LMS activity for 7 days",
    description: "12 students have not logged into LMS in the last week.",
    type: "Warning",
  },
  {
    title: "High risk students without interventions",
    description: "18 high-risk students have no active intervention plan.",
    type: "Critical",
  },
];

export default function AlertsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            Alerts & Notifications
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Central view of system-generated risk alerts for early intervention.
          </p>
        </div>
        <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
          Mark All as Read
        </button>
      </section>

      <section className="card-surface p-4">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold"
            >
              <div>
                <div className="mb-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">
                  {alert.type}
                </div>
                <div className="text-sm font-bold">{alert.title}</div>
                <p className="mt-1 text-[11px] font-medium text-neutral-600">
                  {alert.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[11px]">
                <button className="rounded-full border border-neutral-200 bg-white px-3 py-1">
                  View Details
                </button>
                <button className="rounded-full border border-neutral-200 bg-white px-3 py-1">
                  Create Intervention
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

