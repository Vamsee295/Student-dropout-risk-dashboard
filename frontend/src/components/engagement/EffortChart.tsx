"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = [
    { hours: 10, assignments: 20 },
    { hours: 12, assignments: 25 },
    { hours: 15, assignments: 30 },
    { hours: 8, assignments: 15 },
    { hours: 20, assignments: 28 },
    { hours: 5, assignments: 5 },
    { hours: 25, assignments: 29 },
    { hours: 18, assignments: 27 },
    { hours: 30, assignments: 30 },
    { hours: 14, assignments: 22 },
];

export function EffortChart() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-slate-900">
                Effort vs. Output Analysis
            </h3>
            <p className="mb-6 text-xs text-slate-500">
                Weekly comparison of study hours vs. assignments submitted
            </p>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            dataKey="hours"
                            name="Hours Spent"
                            unit="h"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                            type="number"
                            dataKey="assignments"
                            name="Assignments"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Scatter name="Students" data={data} fill="#3b82f6" fillOpacity={0.6} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
