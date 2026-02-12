"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
    { week: "Week 1", attendance: 50 },
    { week: "Week 2", attendance: 55 },
    { week: "Week 3", attendance: 42 },
    { week: "Week 4", attendance: 38 },
    { week: "Week 5", attendance: 30 },
    { week: "Week 6", attendance: 20 },
    { week: "Week 7", attendance: 10 },
    { week: "Week 8", attendance: 8 },
    { week: "Week 9", attendance: 5 },
    { week: "Week 10", attendance: 3 },
];

export function AttendanceChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Attendance History</h3>
                <button className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-200">This Semester</button>
            </div>

            <div className="flex-1 min-h-[250px] w-full relative">
                {/* Custom Axis Labels positioned absolutely if needed, or use Recharts XAxis/YAxis */}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="week"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        {/* Class Average Reference Line */}
                        <ReferenceLine y={65} stroke="#93c5fd" strokeDasharray="3 3" label={{ position: 'right', value: 'Class Avg', fill: '#93c5fd', fontSize: 10 }} />

                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#f87171" // red-400
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#f87171", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
