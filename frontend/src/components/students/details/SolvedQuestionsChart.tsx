"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

const data = [
    { name: "Easy", value: 41, total: 83, color: "#22c55e" }, // Green
    { name: "Medium", value: 29, total: 31, color: "#facc15" }, // Yellow
    { name: "Hard", value: 4, total: 5, color: "#ef4444" }, // Red
];

// Helper to calculate total solved
const solved = data.reduce((acc, curr) => acc + curr.value, 0);
const totalQuestions = 119; // From design

export function SolvedQuestionsChart() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Solved Questions</h3>
            </div>

            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-around">
                {/* Chart */}
                <div className="relative h-[160px] w-[160px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                                {/* Background ring for remaining? Optional polish */}
                            </Pie>
                            <Label
                                value={`${solved}/${totalQuestions}`}
                                position="center"
                                className="text-lg font-bold fill-slate-900"
                                dy={-5}
                            />
                            <Label
                                value="Questions"
                                position="center"
                                className="text-xs fill-slate-500"
                                dy={15}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend / Progress Bars */}
                <div className="flex flex-1 flex-col gap-4 w-full max-w-xs">
                    {data.map((item) => (
                        <div key={item.name} className="w-full">
                            <div className="mb-1 flex justify-between text-xs font-medium">
                                <span className="text-slate-600">{item.name}</span>
                                <span className="font-bold text-slate-900">{item.value}/{item.total}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${(item.value / item.total) * 100}%`, backgroundColor: item.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
