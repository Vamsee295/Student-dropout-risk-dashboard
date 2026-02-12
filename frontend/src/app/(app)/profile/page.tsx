"use client";

import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { GlobalRankChart } from "@/components/profile/GlobalRankChart";
import { ScoreDistributionChart } from "@/components/profile/ScoreDistributionChart";

export default function ProfilePage() {
    return (
        <div className="max-w-[1600px] mx-auto p-1 text-gray-900">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sidebar - Approx 30-35% width -> col-span-4 */}
                <div className="lg:col-span-4">
                    <ProfileSidebar />
                </div>

                {/* Main Content - Approx 65-70% width -> col-span-8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="h-[400px]">
                        <GlobalRankChart />
                    </div>
                    <div className="h-[350px]">
                        <ScoreDistributionChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
