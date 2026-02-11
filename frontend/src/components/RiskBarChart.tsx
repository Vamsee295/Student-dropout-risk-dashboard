"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type RiskBandDatum = {
  range: string;
  count: number;
};

export interface RiskBarChartProps {
  title?: string;
  subtitle?: string;
  data: RiskBandDatum[];
}

const tooltipStyles = {
  contentStyle: {
    borderRadius: 12,
    borderColor: "#e5e7eb",
    padding: "8px 10px",
  },
  labelStyle: { fontSize: 12, fontWeight: 600 },
};

export function RiskBarChart({
  title = "Risk Probability Distribution",
  subtitle = "Student population spread by risk score.",
  data,
}: RiskBarChartProps) {
  return (
    <section className="card-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {subtitle}
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

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 500, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 500, fill: "#9ca3af" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.06)" }}
              contentStyle={tooltipStyles.contentStyle}
              labelStyle={tooltipStyles.labelStyle}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              fill="url(#riskGradient)"
            />
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

