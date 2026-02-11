 "use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PageProps = {
  params: { id: string };
};

const ATTENDANCE_HISTORY = [
  { week: "Week 1", attendance: 72 },
  { week: "Week 3", attendance: 68 },
  { week: "Week 5", attendance: 60 },
  { week: "Week 7", attendance: 52 },
  { week: "Week 10", attendance: 45 },
];

const STUDENT_LOOKUP: Record<
  string,
  { name: string; program: string; semester: string }
> = {
  "20248912": {
    name: "Marcus Chen",
    program: "B.Sc. Computer Science",
    semester: "Semester 4",
  },
  "20243501": {
    name: "Sarah Miller",
    program: "BA Psychology",
    semester: "Semester 3",
  },
  "20245592": {
    name: "David Kim",
    program: "B.Eng Mechanical",
    semester: "Semester 5",
  },
};

export default function StudentProfilePage({ params }: PageProps) {
  const { id } = params;
  const meta =
    STUDENT_LOOKUP[id] ??
    ({
      name: "Alex Johnson",
      program: "B.Sc. Computer Science",
      semester: "Semester 4",
    } as const);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
              {meta.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">
                  {meta.name}
                </h2>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                  High Risk
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                ID: {id} · {meta.program} · {meta.semester}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                Contact: alex.j@university.edu · (555) 123-4567
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
              Add Case Note
            </button>
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
              Mark as Reviewed
            </button>
            <button className="rounded-full bg-red-500 px-3 py-1.5 text-white">
              Escalate
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Critical Risk Level
            </div>
            <div className="mt-2 text-2xl font-bold text-red-600">88%</div>
            <p className="mt-1 text-[11px] font-medium text-neutral-600">
              Predicted dropout probability based on recent activity.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              LMS Activity
            </div>
            <div className="mt-2 text-sm font-bold text-neutral-900">Inactive</div>
            <p className="mt-1 text-[11px] text-neutral-600">
              No LMS login detected for last 5 days.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Grade Trend
            </div>
            <div className="mt-2 text-sm font-bold text-neutral-900">
              -15% Drop
            </div>
            <p className="mt-1 text-[11px] text-neutral-600">
              Math 201 flagged as critical subject.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              Attendance
            </div>
            <div className="mt-2 text-sm font-bold text-neutral-900">65%</div>
            <p className="mt-1 text-[11px] text-neutral-600">
              Below institution threshold of 75%.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold tracking-tight">
              Why is this student high risk?
            </h3>
            <p className="mt-1 text-xs font-medium text-neutral-500">
              Key contributors identified by the ML model.
            </p>
            <ul className="mt-3 space-y-2 text-xs font-semibold">
              <li className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <span>Attendance Drop</span>
                <span className="text-red-600">-25% vs Class Avg</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span>LMS Dormancy</span>
                <span className="text-amber-700">5+ Days Inactive</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span>Assignment Gap</span>
                <span className="text-amber-700">3 Missed Tasks</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold tracking-tight">
              Attendance History (This Semester)
            </h3>
            <div className="mt-3 h-44 rounded-lg bg-neutral-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ATTENDANCE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ stroke: "#f97373", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#e5e7eb",
                      padding: "8px 10px",
                    }}
                    labelStyle={{ fontSize: 12, fontWeight: 600 }}
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#f97373"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, fill: "#f97373" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-500">
              <span>This Semester</span>
              <span>Class Avg ≈ 78%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold tracking-tight">
              Recommended Actions
            </h3>
            <p className="mt-1 text-xs font-medium text-neutral-500">
              Immediate intervention suggested due to critical risk status.
            </p>
            <div className="mt-3 space-y-2 text-xs font-semibold">
              <button className="w-full rounded-lg bg-black px-3 py-2 text-white">
                Schedule Counseling
              </button>
              <button className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2">
                Assign Peer Mentor
              </button>
              <button className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2">
                Email Student
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold tracking-tight">Advisor Notes</h3>
            <ul className="mt-2 space-y-2 text-[11px] font-medium text-neutral-700">
              <li className="rounded-lg bg-neutral-50 px-3 py-2">
                {`Oct 20 ·`} Student reports difficulty balancing part-time work
                and coursework.
              </li>
              <li className="rounded-lg bg-neutral-50 px-3 py-2">
                {`Oct 05 ·`} Recommended joining peer study group for Math 201.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

