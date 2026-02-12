"use client";

import { MoreHorizontal } from "lucide-react";

type ReportRow = {
    rank: number;
    globalRank: number | null;
    rollNo: string;
    name: string;
    username: string;
    branch: string;
    avatarColor: string;
    scores: {
        hackerRank: number;
        leetCode: { rating: number; solved: number };
        codeChef: number;
        codeForces: number;
        spoj: number;
        smartInterviews: number;
    };
    institutionalPoints: number;
};

const MOCK_DATA: ReportRow[] = [
    {
        rank: 1,
        globalRank: 2991,
        rollNo: "2300030298",
        name: "Kancherla Sirisha",
        username: "sirisha_30298",
        branch: "CSE",
        avatarColor: "bg-orange-100 text-orange-600",
        scores: {
            hackerRank: 942,
            leetCode: { rating: 1980, solved: 542 },
            codeChef: 1990,
            codeForces: 1628,
            spoj: 40,
            smartInterviews: 7800,
        },
        institutionalPoints: 8950,
    },
    {
        rank: 2,
        globalRank: 4353,
        rollNo: "2300031941",
        name: "Yannam Abhinay Reddy",
        username: "abhinay6712",
        branch: "CSE",
        avatarColor: "bg-blue-100 text-blue-600",
        scores: {
            hackerRank: 250,
            leetCode: { rating: 1750, solved: 430 },
            codeChef: 1750,
            codeForces: 1584,
            spoj: 40,
            smartInterviews: 5830,
        },
        institutionalPoints: 7240,
    },
    {
        rank: 3,
        globalRank: 4482,
        rollNo: "2300069009",
        name: "Tumma Amarnadh",
        username: "t_amar2009",
        branch: "EEE",
        avatarColor: "bg-emerald-100 text-emerald-600",
        scores: {
            hackerRank: 50,
            leetCode: { rating: 1620, solved: 312 },
            codeChef: 1680,
            codeForces: 1450,
            spoj: 0,
            smartInterviews: 6200,
        },
        institutionalPoints: 6810,
    },
    {
        rank: 4,
        globalRank: 5890,
        rollNo: "2300030004",
        name: "Priya Sharma",
        username: "priya_s",
        branch: "CSE",
        avatarColor: "bg-purple-100 text-purple-600",
        scores: {
            hackerRank: 486,
            leetCode: { rating: 1510, solved: 255 },
            codeChef: 1520,
            codeForces: 1390,
            spoj: 20,
            smartInterviews: 5600,
        },
        institutionalPoints: 6320,
    },
    {
        rank: 5,
        globalRank: 7719,
        rollNo: "2300030005",
        name: "Rahul Verma",
        username: "rahul_v",
        branch: "IT",
        avatarColor: "bg-sky-100 text-sky-600",
        scores: {
            hackerRank: 316,
            leetCode: { rating: 1500, solved: 250 },
            codeChef: 1480,
            codeForces: 1350,
            spoj: 20,
            smartInterviews: 6250,
        },
        institutionalPoints: 6200,
    },
    // Add a few more placeholders for density
    ...Array.from({ length: 15 }).map((_, i) => ({
        rank: i + 6,
        globalRank: 8000 + i * 150,
        rollNo: `2300030${10 + i}`,
        name: `Student Placeholder ${i + 6}`,
        username: `user_${i + 6}`,
        branch: ["CSE", "ECE", "MECH"][i % 3],
        avatarColor: "bg-slate-100 text-slate-600",
        scores: {
            hackerRank: 150 + i * 10,
            leetCode: { rating: 1400 - i * 10, solved: 200 - i * 5 },
            codeChef: 1400 - i * 12,
            codeForces: 1200 - i * 8,
            spoj: 10,
            smartInterviews: 5000 + i * 50,
        },
        institutionalPoints: 6000 - i * 80,
    })),
];

export function ReportsTable() {
    return (
        <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                        <th className="sticky left-0 min-w-[60px] bg-slate-50 px-6 py-4">
                            Rank
                        </th>
                        <th className="sticky left-[60px] min-w-[120px] bg-slate-50 px-6 py-4">
                            Roll No
                        </th>
                        <th className="sticky left-[180px] min-w-[240px] bg-slate-50 px-6 py-4">
                            Student Name
                        </th>
                        <th className="px-6 py-4">Branch</th>

                        {/* Platform Columns with colored headers option or standard */}
                        <th className="border-l border-slate-100 bg-orange-50/50 px-6 py-4 text-center text-orange-700">
                            LeetCode
                            <div className="mt-1 flex justify-center gap-4 text-[9px] text-orange-500/70">
                                <span>RATING</span>
                                <span>SOLVED</span>
                            </div>
                        </th>
                        <th className="px-6 py-4 text-center">HackerRank</th>
                        <th className="px-6 py-4 text-center">CodeChef</th>
                        <th className="px-6 py-4 text-center">Codeforces</th>
                        <th className="px-6 py-4 text-center">Spoj</th>
                        <th className="px-6 py-4 text-center">Smart Interviews</th>

                        <th className="min-w-[140px] bg-blue-50 px-6 py-4 text-center text-blue-700">
                            Institutional <br /> Points
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {MOCK_DATA.map((row) => (
                        <tr key={row.rank} className="group hover:bg-slate-50">
                            <td className="sticky left-0 bg-white px-6 py-4 font-bold text-slate-900 group-hover:bg-slate-50">
                                {row.rank}
                                {row.globalRank && (
                                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                                        ({row.globalRank})
                                    </span>
                                )}
                            </td>
                            <td className="sticky left-[60px] bg-white px-6 py-4 font-medium text-slate-600 group-hover:bg-slate-50">
                                {row.rollNo}
                            </td>
                            <td className="sticky left-[180px] bg-white px-6 py-4 group-hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${row.avatarColor}`}
                                    >
                                        {row.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{row.name}</span>
                                        <span className="text-[10px] text-slate-400">
                                            @{row.username}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                                {row.branch}
                            </td>

                            {/* LeetCode Data */}
                            <td className="border-l border-slate-100 bg-orange-50/10 px-6 py-4 text-center group-hover:bg-orange-50/20">
                                <div className="flex justify-center gap-6">
                                    <span className="font-bold text-slate-900 w-10 text-right">{row.scores.leetCode.rating}</span>
                                    <span className="font-bold text-emerald-600 w-10 text-left">{row.scores.leetCode.solved}</span>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-center font-medium text-slate-700">
                                {row.scores.hackerRank}
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-700">
                                {row.scores.codeChef}
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-700">
                                {row.scores.codeForces}
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-700">
                                {row.scores.spoj}
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-700">
                                {row.scores.smartInterviews}
                            </td>

                            {/* Institutional Points - Blue Column */}
                            <td className="bg-blue-50 px-6 py-4 text-center text-lg font-bold text-blue-800 group-hover:bg-blue-100">
                                {row.institutionalPoints.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 sticky left-0 right-0">
                <span className="text-xs text-slate-500">
                    Showing <span className="font-bold">1-15</span> of <span className="font-bold">4,500</span> students
                </span>
                <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 hover:bg-slate-50 text-slate-400">
                        <span className="sr-only">Previous</span>
                        &lt;
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-xs font-bold text-blue-600 border border-blue-100">
                        1
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                        2
                    </button>
                    <span className="text-xs text-slate-400">...</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                        300
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
                        <span className="sr-only">Next</span>
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}
