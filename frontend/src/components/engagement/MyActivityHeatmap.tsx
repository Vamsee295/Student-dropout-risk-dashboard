"use client";

import { useState, useEffect, useMemo } from "react";
import apiClient from "@/lib/api";

// Constants for the heatmap
const MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan"];

const getColorClass = (level: number) => {
    switch (level) {
        case 0: return "bg-gray-100 dark:bg-gray-800";
        case 1: return "bg-teal-200";
        case 2: return "bg-teal-300";
        case 3: return "bg-teal-400";
        case 4: return "bg-teal-500";
        default: return "bg-gray-100 dark:bg-gray-800";
    }
};

export function MyActivityHeatmap() {
    const [heatmapData, setHeatmapData] = useState<{ date: Date; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get("/engagement/digital-footprint");
                const students = res.data.heatmap_data || [];

                const weeklyTotals: Record<number, { sum: number; count: number }> = {};
                for (const student of students) {
                    for (const entry of student.weekly_activity || []) {
                        if (!weeklyTotals[entry.week]) {
                            weeklyTotals[entry.week] = { sum: 0, count: 0 };
                        }
                        weeklyTotals[entry.week].sum += entry.activity;
                        weeklyTotals[entry.week].count += 1;
                    }
                }

                const weeklyAvg: Record<number, number> = {};
                for (const [week, val] of Object.entries(weeklyTotals)) {
                    weeklyAvg[Number(week)] = Math.round((val.sum / val.count) / 25);
                }

                const data: { date: Date; count: number }[] = [];
                const year = new Date().getFullYear();
                const startDate = new Date(year, 8, 1);
                const endDate = new Date(year + 1, 0, 30);
                let currentDate = new Date(startDate);
                let weekIndex = 0;
                let dayInWeek = 0;

                while (currentDate <= endDate) {
                    const level = weeklyAvg[weekIndex] ?? 0;
                    data.push({ date: new Date(currentDate), count: Math.min(level, 4) });
                    currentDate.setDate(currentDate.getDate() + 1);
                    dayInWeek++;
                    if (dayInWeek === 7) {
                        dayInWeek = 0;
                        weekIndex++;
                    }
                }

                setHeatmapData(data);
            } catch (err) {
                console.error("Failed to fetch activity data:", err);
                setHeatmapData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Group data by weeks for column-based rendering
    const weeksData = useMemo(() => {
        if (heatmapData.length === 0) return [];

        const weeks: { date: Date; count: number }[][] = [];
        let currentWeek: { date: Date; count: number }[] = [];

        // Pad the start if the first day isn't Sunday
        const firstDay = heatmapData[0].date.getDay();
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({ date: new Date(0), count: -1 }); // -1 for empty/padding
        }

        heatmapData.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // Push remaining days
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [heatmapData]);


    if (loading) {
        return <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm min-h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Loading your activity...</div>
        </div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">My Participation Map</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <span>Less active</span>
                    <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-sm bg-gray-100"></span>
                        <span className="w-3 h-3 rounded-sm bg-teal-200"></span>
                        <span className="w-3 h-3 rounded-sm bg-teal-300"></span>
                        <span className="w-3 h-3 rounded-sm bg-teal-400"></span>
                        <span className="w-3 h-3 rounded-sm bg-teal-500"></span>
                    </div>
                    <span>More active</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[700px] flex flex-col gap-2">

                    {/* Month Labels */}
                    <div className="flex text-xs text-gray-400 pl-8 mb-1">
                        <div className="w-10"></div> {/* Data row offset */}
                        <div className="flex justify-between w-full px-4">
                            {MONTHS.map(m => <span key={m}>{m}</span>)}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Day Labels (Mon, Wed, Fri) */}
                        <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium h-[100px] py-1">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex gap-1 flex-1">
                            {weeksData.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => (
                                        day.count === -1 ? (
                                            <div key={dayIndex} className="w-3 h-3"></div>
                                        ) : (
                                            <div
                                                key={dayIndex}
                                                className={`w-3 h-3 rounded-sm ${getColorClass(day.count)} hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer`}
                                                title={`${day.date.toDateString()}: Level ${day.count} Activity`}
                                            />
                                        )
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
                Keep up the good work! Consistent activity improves your success score.
            </div>
        </div>
    );
}
