"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { hours: 2, assignments: 1, student: "A" },
    { hours: 3, assignments: 2, student: "B" },
    { hours: 5, assignments: 4, student: "C" },
    { hours: 4, assignments: 3, student: "D" },
    { hours: 7, assignments: 5, student: "E" },
    { hours: 6, assignments: 4, student: "F" },
    { hours: 1, assignments: 1, student: "G" },
    { hours: 8, assignments: 6, student: "H" },
    { hours: 5, assignments: 5, student: "I" },
    { hours: 3, assignments: 1, student: "J" },
];

export function EffortOutputChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="mb-4">
                <h3 className="font-bold text-gray-900">Effort vs. Output Analysis</h3>
                <p className="text-xs text-gray-500">Weekly comparison of study hours vs. assignments submitted</p>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                            type="number"
                            dataKey="hours"
                            name="Hours Spent"
                            unit="h"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            type="number"
                            dataKey="assignments"
                            name="Assignments"
                            unit=""
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Students" data={data} fill="#3b82f6" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 mt-2">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Hours Spent</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Assignments</div>
            </div>
        </div>
    );
}
