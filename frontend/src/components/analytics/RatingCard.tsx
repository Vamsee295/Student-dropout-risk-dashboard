"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface RatingCardProps {
    platform: string;
    currentRating: number;
    highestRating: number;
    totalContests: number;
    ratingChange: number;
    color: string;
    data: { value: number }[];
}

export function RatingCard({
    platform,
    currentRating,
    highestRating,
    totalContests,
    ratingChange,
    color,
    data,
}: RatingCardProps) {
    const isPositive = ratingChange >= 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-slate-700">{platform} Ratings</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs font-semibold text-slate-500">Current Rating</div>
                    <div className="text-lg font-bold text-slate-900">{currentRating}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold text-slate-500">Highest Rating</div>
                    <div className="text-lg font-bold text-slate-500">{highestRating}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold text-slate-500">Total Contests</div>
                    <div className="text-lg font-bold text-slate-500">{totalContests}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold text-slate-500">Rating Change</div>
                    <div
                        className={`flex items-center gap-1 text-lg font-bold ${isPositive ? "text-emerald-600" : "text-red-600"
                            }`}
                    >
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(ratingChange)}
                    </div>
                </div>
            </div>

            <div className="mt-4 h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={color}
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
