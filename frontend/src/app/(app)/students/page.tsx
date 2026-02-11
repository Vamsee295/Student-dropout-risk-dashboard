import Link from "next/link";

const students = [
  {
    id: "20248912",
    name: "Marcus Chen",
    course: "B.Sc. Computer Science",
    department: "Engineering",
    riskTrend: "+12% Risk",
    attendance: "62%",
    engagement: "45 / 100",
    lastInteraction: "Oct 24, 2025",
    riskLevel: "High",
  },
  {
    id: "20243501",
    name: "Sarah Miller",
    course: "BA Psychology",
    department: "Humanities",
    riskTrend: "Stable",
    attendance: "78%",
    engagement: "68 / 100",
    lastInteraction: "Oct 18, 2025",
    riskLevel: "Medium",
  },
  {
    id: "20245592",
    name: "David Kim",
    course: "B.Eng Mechanical",
    department: "Engineering",
    riskTrend: "-5% Risk",
    attendance: "92%",
    engagement: "88 / 100",
    lastInteraction: "Oct 20, 2025",
    riskLevel: "Low",
  },
];

function RiskBadge({ level }: { level: string }) {
  const color =
    level === "High"
      ? "bg-red-50 text-red-600 border-red-200"
      : level === "Medium"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${color}`}
    >
      {level} Risk
    </span>
  );
}

export default function StudentsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            Student Directory
          </h2>
          <p className="text-xs font-medium text-neutral-500">
            Manage student data and monitor dropout risk factors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
            Assign Advisor
          </button>
          <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
            Schedule Group Counseling
          </button>
          <button className="rounded-full bg-black px-3 py-1.5 text-white">
            Export Selected
          </button>
        </div>
      </section>

      <section className="card-surface p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[220px]">
            <input
              placeholder="Search by name or student ID..."
              className="w-full rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium placeholder:text-neutral-400 focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <button className="rounded-full bg-black px-3 py-1 text-white">
              All Students
            </button>
            <button className="rounded-full bg-red-50 px-3 py-1 text-red-600">
              High Risk
            </button>
            <button className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              Medium Risk
            </button>
            <button className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              Low Risk
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Student</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Course / Dept
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Risk Trend
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Attendance
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Engagement
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Last Interaction
                </th>
                <th className="px-4 py-2 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-t border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {student.name}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        ID: {student.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[11px]">
                    <div className="font-semibold text-neutral-800">
                      {student.course}
                    </div>
                    <div className="text-neutral-500">
                      {student.department} Dept
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[11px] font-semibold">
                    {student.riskTrend}
                  </td>
                  <td className="px-4 py-3 align-top text-[11px] font-semibold">
                    {student.attendance}
                  </td>
                  <td className="px-4 py-3 align-top text-[11px]">
                    <div className="font-semibold text-neutral-800">
                      Score {student.engagement}
                    </div>
                    <RiskBadge level={student.riskLevel} />
                  </td>
                  <td className="px-4 py-3 align-top text-[11px] text-neutral-600">
                    {student.lastInteraction}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-[11px]">
                    <Link
                      href={`/students/${student.id}`}
                      className="rounded-full bg-black px-3 py-1 text-white"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2 text-[11px] font-medium text-neutral-600">
            <span>
              Showing 1 to {students.length} of 1,240 results (sample data)
            </span>
            <div className="flex items-center gap-1">
              <button className="h-7 w-7 rounded-full bg-black text-white">
                1
              </button>
              <button className="h-7 w-7 rounded-full border border-neutral-200">
                2
              </button>
              <button className="h-7 w-7 rounded-full border border-neutral-200">
                3
              </button>
              <span className="px-1">...</span>
              <button className="h-7 w-7 rounded-full border border-neutral-200">
                8
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

