"use client";

import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { GlobalRankChart } from "@/components/profile/GlobalRankChart";
import { ScoreDistributionChart } from "@/components/profile/ScoreDistributionChart";

export default function ProfilePage() {
    return (
        <div className="max-w-[1240px] mx-auto p-4 text-gray-900 bg-[#f8f9fa] min-h-[calc(100vh-64px)] rounded-xl mt-4">
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
                    <div className="h-[300px]">
                        <ScoreDistributionChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
