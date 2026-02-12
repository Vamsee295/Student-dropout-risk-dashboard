"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";

const data = [
    { x: 65, y: 2.1, z: 20, name: "Intro to CS", risk: "High" },
    { x: 72, y: 2.5, z: 15, name: "Math 101", risk: "High" },
    { x: 85, y: 3.2, z: 10, name: "History", risk: "Low" },
    { x: 92, y: 3.8, z: 30, name: "Physics", risk: "Low" },
    { x: 55, y: 1.8, z: 25, name: "Macroeconomics", risk: "High" }, // High risk outlier
    { x: 88, y: 3.5, z: 18, name: "Art", risk: "Low" },
    { x: 78, y: 2.9, z: 12, name: "Chemistry", risk: "Medium" },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-lg text-xs">
                <p className="font-bold text-gray-900">{data.name}</p>
                <p className="text-gray-500">Attendance: {data.x}%</p>
                <p className="text-gray-500">GPA: {data.y}</p>
            </div>
        );
    }
    return null;
};

export function CorrelationChart() {
    return (
        <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900">Correlation Analysis</h3>
                    <p className="text-xs text-gray-500">Avg Grade vs. Attendance Rate</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-400"></span>
                        <span className="text-gray-600">High Risk</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span className="text-gray-600">Low Risk</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full relative">
                {/* Background Zone Labels */}
                <div className="absolute left-2 bottom-2 text-[10px] font-bold text-red-300 z-0">Risk Zone</div>
                <div className="absolute right-2 top-2 text-[10px] font-bold text-green-300 z-0">High Performance</div>

                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Attendance"
                            unit="%"
                            domain={[40, 100]}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'Attendance Rate (%)', position: 'bottom', fontSize: 10, fill: '#9ca3af', offset: 0 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="GPA"
                            domain={[0, 4]}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'Avg Grade (GPA)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Courses" data={data}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.risk === 'High' ? '#f87171' : (entry.risk === 'Medium' ? '#fbbf24' : '#60a5fa')}
                                    fillOpacity={0.6}
                                    stroke={entry.risk === 'High' ? '#ef4444' : (entry.risk === 'Medium' ? '#f59e0b' : '#3b82f6')}
                                />
                            ))}
                            <LabelList dataKey="z" position="top" /> {/* Placeholder size mapping */}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
