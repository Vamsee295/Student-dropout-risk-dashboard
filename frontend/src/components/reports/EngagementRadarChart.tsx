"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { subject: 'Assignment Quality', student: 60, average: 85, fullMark: 100 },
    { subject: 'Punctuality', student: 50, average: 90, fullMark: 100 },
    { subject: 'LMS Time', student: 30, average: 75, fullMark: 100 },
    { subject: 'Participation', student: 70, average: 80, fullMark: 100 },
    { subject: 'Quiz Scores', student: 65, average: 78, fullMark: 100 },
];

export function EngagementRadarChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="mb-2">
                <h3 className="font-bold text-gray-900">Engagement vs Class Average</h3>
                <p className="text-xs text-gray-500">Assignment Quality, Punctuality, etc.</p>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Student"
                            dataKey="student"
                            stroke="#f87171"
                            fill="#f87171"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Class Average"
                            dataKey="average"
                            stroke="#93c5fd"
                            fill="#93c5fd"
                            fillOpacity={0.3}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
