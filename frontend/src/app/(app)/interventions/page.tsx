const columns = ["Pending Actions", "In Progress", "Completed"];

export default function InterventionsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">Intervention Board</h2>
          <p className="text-xs font-medium text-neutral-500">
            Manage and track student support actions based on risk predictions.
          </p>
        </div>
        <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
          New Intervention
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column}
            className="flex flex-col card-surface p-3 text-xs font-semibold"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">{column}</h3>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600">
                Sample
              </span>
            </div>
            <div className="space-y-2">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between">
                  <span>Isabella Chen</span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600">
                    High Risk
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-600">
                  Attendance dropped by 15% over last 3 weeks.
                </p>
                <p className="mt-1 text-[11px] text-neutral-700">
                  Suggested: Schedule counseling session.
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

