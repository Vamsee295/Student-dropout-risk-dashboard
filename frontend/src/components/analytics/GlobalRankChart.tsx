"use client";

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const data = [
    { date: "Apr 25", rank: 50000 },
    { date: "May 25", rank: 35000 },
    { date: "Jun 25", rank: 32000 },
    { date: "Jul 25", rank: 28000 },
    { date: "Aug 25", rank: 29000 },
    { date: "Sep 25", rank: 25000 },
    { date: "Oct 25", rank: 22000 },
    { date: "Nov 25", rank: 18000 },
    { date: "Dec 25", rank: 14000 },
    { date: "Jan 26", rank: 13856 },
];

export function GlobalRankChart() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-base font-semibold text-slate-700">Global Rankings</h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            reversed={true} // Rank 1 is top
                            domain={[0, 50000]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                            }}
                        />
                        <Area
                            type="stepAfter"
                            dataKey="rank"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="url(#colorRank)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
