"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
    { range: "0-20%", count: 65, color: "#dbeafe" }, // blue-100
    { range: "20-40%", count: 48, color: "#bfdbfe" }, // blue-200
    { range: "40-60%", count: 28, color: "#60a5fa" }, // blue-400
    { range: "60-80%", count: 18, color: "#3b82f6" }, // blue-500
    { range: "80-100%", count: 12, color: "#2563eb" }, // blue-600
];

export function RiskDistributionChart() {
    return (
        <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Risk Probability Distribution</h3>
                    <p className="text-xs text-slate-500">Student population spread by risk score</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-100"></div> Low</span>
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-600"></div> High</span>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={32}>
                        <XAxis
                            dataKey="range"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
