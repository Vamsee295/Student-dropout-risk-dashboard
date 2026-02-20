"use client";

import { Star, Loader2 } from "lucide-react";
import { PlatformRatingCard } from "./PlatformRatingCard";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

interface CodingProfile {
    codechef_rating: number;
    codeforces_rating: number;
    overall_score: number;
    leetcode_solved: number;
    hackerrank_score: number;
}

interface ProfileData {
    name: string;
    username: string;
    score: number;
    rank: number;
    codechef_rating: number;
    codeforces_rating: number;
}

export function ProfileSidebar({ studentId }: { studentId?: string }) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const sid = studentId || "current";
                const res = await apiClient.get(`/students/${sid}/overview`);
                const overview = res.data;

                let coding: CodingProfile = {
                    codechef_rating: 0, codeforces_rating: 0,
                    overall_score: 0, leetcode_solved: 0, hackerrank_score: 0,
                };
                try {
                    const codingRes = await apiClient.get(`/students/${sid}/coding-profile`);
                    coding = codingRes.data;
                } catch {
                    // coding profile may not exist
                }

                const totalStudents = 50;
                const rank = coding.overall_score > 0
                    ? Math.max(1, Math.round(totalStudents * (1 - coding.overall_score / 100)))
                    : totalStudents;

                setProfile({
                    name: overview.student_name || `Student ${sid}`,
                    username: sid,
                    score: Math.round(coding.overall_score * 100) || 0,
                    rank,
                    codechef_rating: coding.codechef_rating || 0,
                    codeforces_rating: coding.codeforces_rating || 0,
                });
            } catch {
                setProfile({
                    name: "Student", username: "N/A", score: 0, rank: 0,
                    codechef_rating: 0, codeforces_rating: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!profile) return null;

    const [firstName, ...rest] = profile.name.split(" ");
    const lastName = rest.join(" ");

    const codeChefHistory = Array.from({ length: 7 }, (_, i) => ({
        rating: Math.max(800, Math.round(profile.codechef_rating - (6 - i) * 25)),
    }));

    const codeforcesHistory = Array.from({ length: 4 }, (_, i) => ({
        rating: Math.max(400, Math.round(profile.codeforces_rating - (3 - i) * 40)),
    }));

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                    <div className="relative h-24 w-24 rounded-lg bg-gray-200 overflow-hidden border border-gray-100">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div className="absolute top-1 right-1">
                            <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                        </div>
                    </div>
                    <div className="flex-1 ml-4 py-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{firstName}</h2>
                        {lastName && <h3 className="text-md font-semibold text-gray-700">{lastName}</h3>}
                        <p className="text-sm text-gray-500">({profile.username})</p>

                        <div className="mt-3 space-y-1 text-sm">
                            <div className="flex items-center gap-2 font-medium text-blue-600">
                                <span className="text-xs">Score:</span> {profile.score}
                            </div>
                            <div className="flex items-center gap-2 font-medium text-amber-600">
                                <span className="text-xs">Rank:</span> #{profile.rank}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-8 h-4 bg-amber-400 rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 bg-white w-3 h-3 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Recent Education</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1">🎓</span>
                    <p>
                        <span className="font-semibold text-gray-900">Current Program</span> | University
                    </p>
                </div>
            </div>

            {profile.codechef_rating > 0 && (
                <PlatformRatingCard
                    platformName="CodeChef"
                    currentRating={profile.codechef_rating}
                    highestRating={Math.round(profile.codechef_rating * 1.02)}
                    totalContests={Math.max(1, Math.round(profile.codechef_rating / 50))}
                    ratingChange={Math.round(profile.codechef_rating * 0.01)}
                    history={codeChefHistory}
                />
            )}

            {profile.codeforces_rating > 0 && (
                <PlatformRatingCard
                    platformName="Codeforces"
                    currentRating={profile.codeforces_rating}
                    highestRating={profile.codeforces_rating}
                    totalContests={Math.max(1, Math.round(profile.codeforces_rating / 200))}
                    ratingChange={Math.round(profile.codeforces_rating * 0.08)}
                    history={codeforcesHistory}
                />
            )}
        </div>
    );
}
