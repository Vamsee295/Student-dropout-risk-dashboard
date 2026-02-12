"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { name: "Low Risk", value: 65, color: "#10b981" },
    { name: "Medium Risk", value: 25, color: "#f59e0b" },
    { name: "High Risk", value: 10, color: "#ef4444" },
];

export function RiskDistributionChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Risk Distribution</h3>

            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        {/* Legend handled custom below for better layout control */}
                    </PieChart>
                </ResponsiveContainer>

                {/* Centered label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-900">10%</span>
                        <span className="block text-xs text-gray-500 font-medium uppercase">High Risk</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
