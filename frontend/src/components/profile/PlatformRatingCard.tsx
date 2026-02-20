"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface PlatformRatingCardProps {
    platformName: string;
    currentRating: number;
    highestRating: number;
    totalContests: number;
    ratingChange: number;
    history: { rating: number }[];
}

export function PlatformRatingCard({
    platformName,
    currentRating,
    highestRating,
    totalContests,
    ratingChange,
    history,
}: PlatformRatingCardProps) {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">{platformName} Ratings</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Current Rating</p>
                    <p className="font-bold text-gray-900">{currentRating}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Highest Rating</p>
                    <p className="font-bold text-gray-900">{highestRating}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Contests</p>
                    <p className="font-bold text-gray-900">{totalContests}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Rating Change</p>
                    <div className="flex items-center gap-1 font-bold text-green-600">
                        <span>↗ {ratingChange}</span>
                    </div>
                </div>
            </div>

            <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#fbbf24" // Amber/Yellowish
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                <span>Start</span>
                <span>Current</span>
            </div>
        </div>
    );
}
