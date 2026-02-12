"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
    { date: "Apr 25", rank: 35000 },
    { date: "May 10", rank: 28000 },
    { date: "Jun 15", rank: 28000 },
    { date: "Jul 01", rank: 24000 },
    { date: "Aug 20", rank: 24500 },
    { date: "Sep 05", rank: 22000 },
    { date: "Oct 10", rank: 21500 },
    { date: "Nov 15", rank: 19000 },
    { date: "Dec 01", rank: 14000 },
    { date: "Jan 10", rank: 13867 },
    { date: "Jan 25", rank: 14200 }, // Slight dip to match image curve
];

export function GlobalRankChart() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <h3 className="mb-6 font-bold text-gray-900">Global Rankings</h3>

            <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            dy={10}
                        />
                        {/* 
              Y-axis needs to be reversed because lower rank (1) is better/higher visually usually, 
              but the provided image shows a "mountain" growing, which implies Score or Rating, not Rank number (where smaller is better).
              Alternatively, the user provided image shows "Global Rankings" but the graph goes UP. 
              Usually score goes up. Rank number goes down (approaches 1).
              However, assuming the user wants to mimic the VISUALS, the graph goes UP.
              I will assume the Y-axis value increases. 
              Let's treat it as "Score affecting Rank" or simply "Progress".
              Or if it is Rank, maybe they started at 50,000 and moved to 13,000... NO, that would be a downward curve mathematically.
              Wait, the image Y axis says 0 at top, 50000 at bottom!
              So it IS a reversed axis! 
            */}
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            reversed={true}
                            domain={[0, 50000]}
                        />
                        <Area
                            type="stepAfter" // The image looks like steps
                            dataKey="rank"
                            stroke="#f59e0b" // Orange/Amber
                            fill="#fcd34d" // Lighter amber fill
                            fillOpacity={0.6}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
