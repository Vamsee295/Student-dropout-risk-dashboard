"use client";

import { useMemo } from "react";

// Mock data generation for a contribution graph
// Expanded to cover 52 weeks (1 year) for full width
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Wed", "Fri"];

export function ActivityHeatmap() {
    const activityData = useMemo(() => {
        // Generate 52 weeks of data
        // 0 = no activity, 1 = low, 2 = medium, 3 = high, 4 = very high
        const weeks = 52;
        const days = 7;
        const grid = [];

        for (let w = 0; w < weeks; w++) {
            const week = [];
            for (let d = 0; d < days; d++) {
                // Random intensity
                const rand = Math.random();
                let level = 0;
                let count = 0; // Problems solved count

                if (rand > 0.85) {
                    level = 4;
                    count = Math.floor(Math.random() * 5) + 8; // 8-12 problems
                } else if (rand > 0.65) {
                    level = 3;
                    count = Math.floor(Math.random() * 4) + 4; // 4-7 problems
                } else if (rand > 0.45) {
                    level = 2;
                    count = Math.floor(Math.random() * 3) + 1; // 1-3 problems
                } else if (rand > 0.2) {
                    level = 1;
                    count = 1; // 1 problem
                }

                week.push({ level, count });
            }
            grid.push(week);
        }
        return grid;
    }, []);

    const getColor = (level: number) => {
        switch (level) {
            case 1:
                return "bg-teal-100";
            case 2:
                return "bg-teal-300";
            case 3:
                return "bg-teal-500";
            case 4:
                return "bg-teal-700";
            default:
                return "bg-slate-100";
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Digital Footprint (LMS Logins & Problems)
                    </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Less active</span>
                    <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-sm bg-slate-100"></div>
                        <div className="h-3 w-3 rounded-sm bg-teal-100"></div>
                        <div className="h-3 w-3 rounded-sm bg-teal-300"></div>
                        <div className="h-3 w-3 rounded-sm bg-teal-500"></div>
                        <div className="h-3 w-3 rounded-sm bg-teal-700"></div>
                    </div>
                    <span>More active</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex min-w-max">
                    {/* Y-Axis Labels (Day) */}
                    <div className="mr-3 flex flex-col justify-between pt-5 text-[10px] font-medium text-slate-400 h-[100px]">
                        {DAYS.map(d => <span key={d} className="h-3 leading-3">{d}</span>)}
                    </div>

                    <div className="flex-1">
                        {/* X-Axis Labels (Month) */}
                        <div className="mb-2 flex justify-between px-2 text-[10px] font-medium text-slate-400">
                            {MONTHS.map(m => <span key={m}>{m}</span>)}
                        </div>

                        <div className="flex gap-1">
                            {activityData.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-1">
                                    {week.map((day, dIndex) => (
                                        <div
                                            key={`${wIndex}-${dIndex}`}
                                            className={`h-3 w-3 rounded-[1px] ${getColor(day.level)} transition-all hover:ring-2 hover:ring-slate-400 hover:scale-125 cursor-pointer`}
                                            title={`${day.count} problems solved`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
