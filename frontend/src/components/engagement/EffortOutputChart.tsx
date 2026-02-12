"use client";

import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const data = [
    { week: "Week 1", hours: 12, assignments: 2 },
    { week: "Week 2", hours: 15, assignments: 3 },
    { week: "Week 3", hours: 8, assignments: 1 }, // Dip
    { week: "Week 4", hours: 22, assignments: 5 }, // Peak
    { week: "Week 5", hours: 18, assignments: 4 },
    { week: "Week 6", hours: 25, assignments: 6 },
    { week: "Week 7", hours: 20, assignments: 5 },
    { week: "Week 8", hours: 10, assignments: 2 },
];

export function EffortOutputChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">⚖️</span>
                    <h3 className="font-bold text-gray-900">Effort vs. Output Analysis</h3>
                </div>
                <p className="text-xs text-gray-500">Weekly comparison of study hours vs. assignments submitted</p>
            </div>

            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Assignments', angle: 90, position: 'insideRight', style: { fill: '#9ca3af', fontSize: 10 } }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f9fafb' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />

                        <Bar
                            yAxisId="left"
                            dataKey="hours"
                            name="Hours Spent"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="assignments"
                            name="Assignments Submitted"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
