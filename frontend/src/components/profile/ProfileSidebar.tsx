"use client";

import { Star } from "lucide-react";
import { PlatformRatingCard } from "./PlatformRatingCard";

export function ProfileSidebar() {
    const codeChefHistory = [
        { rating: 1000 }, { rating: 1050 }, { rating: 1020 }, { rating: 1080 },
        { rating: 1150 }, { rating: 1120 }, { rating: 1188 }
    ];

    const codeforcesHistory = [
        { rating: 600 }, { rating: 650 }, { rating: 700 }, { rating: 822 }
    ];

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                    <div className="relative h-24 w-24 rounded-lg bg-gray-200 overflow-hidden border border-gray-100">
                        {/* Mock Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div className="absolute top-1 right-1">
                            <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                        </div>
                    </div>
                    <div className="flex-1 ml-4 py-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Vamsee Krishna</h2>
                        <h3 className="text-md font-semibold text-gray-700">Vemulapalli</h3>
                        <p className="text-sm text-gray-500">(Vamsee05)</p>

                        <div className="mt-3 space-y-1 text-sm">
                            <div className="flex items-center gap-2 font-medium text-blue-600">
                                <span className="text-xs">📈</span> Overall Score: 16300
                            </div>
                            <div className="flex items-center gap-2 font-medium text-amber-600">
                                <span className="text-xs">🌐</span> Global Rank: 13867
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {/* Toggle switch mock */}
                        <div className="w-8 h-4 bg-amber-400 rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 bg-white w-3 h-3 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Education */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Recent Education</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1">🎓</span>
                    <p>
                        <span className="font-semibold text-gray-900">Bachelor of Technology (BTech)</span> | (KLU) KL University
                    </p>
                </div>
            </div>

            {/* Platform Ratings */}
            <PlatformRatingCard
                platformName="CodeChef"
                currentRating={1188}
                highestRating={1215}
                totalContests={23}
                ratingChange={16}
                history={codeChefHistory}
            />

            <PlatformRatingCard
                platformName="Codeforces"
                currentRating={822}
                highestRating={822}
                totalContests={4}
                ratingChange={72}
                history={codeforcesHistory}
            />
        </div>
    );
}
