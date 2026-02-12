"use client";

import { ProfileCard } from "@/components/analytics/ProfileCard";
import { RatingCard } from "@/components/analytics/RatingCard";
import { GlobalRankChart } from "@/components/analytics/GlobalRankChart";
import { ScoreDistribution } from "@/components/analytics/ScoreDistribution";

const CODECHEF_DATA = [
    { value: 1100 },
    { value: 1120 },
    { value: 1080 },
    { value: 1150 },
    { value: 1188 },
];

const CODEFORCES_DATA = [
    { value: 800 },
    { value: 822 },
    { value: 810 },
    { value: 815 },
    { value: 822 },
];

export default function AnalyticsPage() {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Profile & Ratings */}
            <div className="space-y-6 lg:col-span-1">
                <ProfileCard />

                <div className="space-y-6">
                    <RatingCard
                        platform="CodeChef"
                        currentRating={1188}
                        highestRating={1215}
                        totalContests={23}
                        ratingChange={16}
                        color="#f59e0b" // Amber
                        data={CODECHEF_DATA}
                    />
                    <RatingCard
                        platform="Codeforces"
                        currentRating={822}
                        highestRating={822}
                        totalContests={4}
                        ratingChange={72}
                        color="#ec4899" // Pink
                        data={CODEFORCES_DATA}
                    />
                </div>
            </div>

            {/* Right Column: Charts */}
            <div className="space-y-6 lg:col-span-2">
                <GlobalRankChart />
                <ScoreDistribution />
            </div>
        </div>
    );
}
