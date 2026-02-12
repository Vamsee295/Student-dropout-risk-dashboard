"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const months = ["Sep", "Oct", "Nov", "Dec", "Jan"];

const getColor = (level: number) => {
    if (level >= 80) return "bg-teal-500"; // High activity
    if (level >= 60) return "bg-teal-400";
    if (level >= 40) return "bg-emerald-300";
    if (level >= 20) return "bg-emerald-200";
    return "bg-gray-100"; // Low/no activity
};

interface WeeklyActivity {
    week: string;
    activity: number;
}

interface StudentFootprint {
    student_id: string;
    student_name: string;
    weekly_activity: WeeklyActivity[];
}

export function LMSHeatmapChart() {
    const [data, setData] = useState<StudentFootprint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/engagement/digital-footprint`);
            const result = await response.json();
            setData(result.heatmap_data || []);
        } catch (error) {
            console.error("Error fetching digital footprint data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="text-center py-8 text-gray-500">Loading heatmap...</div>
        </div>;
    }

    // Transpose data for heatmap visualization (weeks as columns, students as rows)
    const weeks = data[0]?.weekly_activity?.length || 8;

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-xl">👣</span>
                    <h3 className="font-bold text-gray-900">Digital Footprint (LMS Logins)</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Less active</span>
                    <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-[2px] bg-gray-100"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-emerald-200"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-emerald-300"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-teal-400"></span>
                        <span className="w-3 h-3 rounded-[2px] bg-teal-500"></span>
                    </div>
                    <span>More active</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[600px]">
                    {/* Week Labels */}
                    <div className="flex gap-2 mb-2 pl-32">
                        {Array.from({ length: weeks }).map((_, i) => (
                            <div key={i} className="text-xs text-gray-400 font-medium w-12 text-center">
                                W{i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="space-y-1">
                        {data.slice(0, 10).map((student) => (
                            <div key={student.student_id} className="flex items-center gap-2">
                                {/* Student Name */}
                                <div className="w-28 text-xs text-gray-600 font-medium truncate">
                                    {student.student_name}
                                </div>

                                {/* Activity Cells */}
                                <div className="flex gap-1">
                                    {student.weekly_activity.map((week, wIndex) => (
                                        <div
                                            key={wIndex}
                                            className={`w-12 h-6 rounded ${getColor(week.activity)} hover:opacity-80 transition-opacity cursor-pointer`}
                                            title={`${student.student_name} - ${week.week}: ${week.activity}% activity`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.length === 0 && (
                        <div className="text-center py-8 text-gray-400">No activity data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
