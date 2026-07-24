"use client";

import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

interface PlatformRatingCardProps {
    platformName: string;
    currentRating: number;
    highestRating: number;
    totalContests: number;
    ratingChange: number;
    history: { date?: string, rating: number }[];
    showRatingChange?: boolean;
}

export function PlatformRatingCard({
    platformName,
    currentRating,
    highestRating,
    totalContests,
    ratingChange,
    history,
    showRatingChange = true,
}: PlatformRatingCardProps) {
    return (
        <div className="rounded-sm border border-gray-200 bg-white shadow-sm mt-4">
            <h4 className="p-4 text-[13px] font-medium text-gray-800 pb-2">{platformName} Ratings</h4>

            <div className="px-4 grid grid-cols-2 gap-2 mb-6">
                <div className="border border-gray-200 rounded-sm p-2 flex flex-col justify-between">
                    <p className="text-[11px] text-gray-600">Current Rating</p>
                    <p className="font-semibold text-[13px] text-gray-800">{currentRating}</p>
                </div>
                <div className="border border-gray-200 rounded-sm p-2 flex flex-col justify-between">
                    <p className="text-[11px] text-gray-600">Highest Rating</p>
                    <p className="font-semibold text-[13px] text-gray-800">{highestRating}</p>
                </div>
                <div className="border border-gray-200 rounded-sm p-2 flex flex-col justify-between">
                    <p className="text-[11px] text-gray-600">Total Contests</p>
                    <p className="font-semibold text-[13px] text-gray-800">{totalContests}</p>
                </div>
                {showRatingChange && (
                    <div className="border border-gray-200 rounded-sm p-2 flex flex-col justify-between">
                        <p className="text-[11px] text-gray-600">Rating Change</p>
                        <div className="flex items-center gap-1 font-semibold text-[13px] text-green-600">
                            <span className="text-sm leading-none">↗</span> {ratingChange}
                        </div>
                    </div>
                )}
            </div>

            <div className="h-32 w-full mt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${platformName}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ffedd5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: "#6b7280" }}
                            dy={5}
                            interval="preserveStartEnd"
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px', padding: '4px 8px' }}
                            itemStyle={{ color: '#374151', fontSize: '12px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rating"
                            stroke="#f97316"
                            strokeWidth={1.5}
                            fillOpacity={1}
                            fill={`url(#gradient-${platformName})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {/* The XAxis replaces the custom Start/Current absolute positioning */}
        </div>
    );
}
