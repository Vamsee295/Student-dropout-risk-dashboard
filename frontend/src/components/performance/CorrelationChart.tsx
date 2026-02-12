"use client";

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: "Intro to CS", attendance: 65, gpa: 2.1, risk: "High" },
    { name: "Math 101", attendance: 72, gpa: 2.5, risk: "Medium" },
    { name: "History", attendance: 85, gpa: 3.2, risk: "Low" },
    { name: "Physics", attendance: 92, gpa: 3.8, risk: "Low" },
    { name: "Macroecon", attendance: 55, gpa: 1.8, risk: "High" },
    { name: "Art", attendance: 88, gpa: 3.5, risk: "Low" },
    { name: "Chemistry", attendance: 78, gpa: 2.9, risk: "Medium" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-xl text-xs">
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                <div className="space-y-1">
                    <p className="text-blue-600 font-medium">Attendance: {payload[0].value}%</p>
                    <p className="text-emerald-600 font-medium">GPA: {payload[1].value}</p>
                </div>
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
                    <h3 className="font-bold text-gray-900">Performance Overview</h3>
                    <p className="text-xs text-gray-500">Attendance vs. GPA by Course</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                        <CartesianGrid stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="name"
                            scale="band"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                        />
                        <YAxis
                            yAxisId="left"
                            label={{ value: 'Attendance (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6' }}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'GPA', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10b981' }}
                            domain={[0, 4]}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar yAxisId="left" dataKey="attendance" name="Attendance %" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="gpa" name="GPA" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
