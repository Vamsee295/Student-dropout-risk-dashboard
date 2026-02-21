"use client";

import { useEffect, useState } from "react";
import { facultyService, type StudentCodingStats } from "@/services/faculty";
import {
    Loader2,
    Search,
    Download,
    Filter,
    Trophy,
    Code,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { exportToCSV } from "@/utils/exportUtils";

export default function CodingReportsPage() {
    const [students, setStudents] = useState<StudentCodingStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await facultyService.getCodingReports();
                // Sort by overall score by default
                const sorted = data.sort((a, b) => (b.coding_profile?.overall_score || 0) - (a.coding_profile?.overall_score || 0));
                setStudents(sorted);
            } catch (error) {
                console.error("Failed to fetch coding reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter ? student.department === departmentFilter : true;
        return matchesSearch && matchesDept;
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Code className="text-indigo-600" />
                        Coding Profiles Report
                    </h1>
                    <p className="text-gray-500">Comprehensive view of student performance across competitive programming platforms.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const rows = filteredStudents.map((s, i) => ({
                                Rank: i + 1,
                                Name: s.name,
                                ID: s.id,
                                Department: s.department,
                                HackerRank_Score: s.coding_profile?.hackerrank_score || 0,
                                HackerRank_Solved: s.coding_profile?.hackerrank_solved || 0,
                                LeetCode_Rating: s.coding_profile?.leetcode_rating || 0,
                                LeetCode_Solved: s.coding_profile?.leetcode_solved || 0,
                                CodeChef_Rating: s.coding_profile?.codechef_rating || 0,
                                CodeForces_Rating: s.coding_profile?.codeforces_rating || 0,
                                Overall_Score: s.coding_profile?.overall_score || 0,
                            }));
                            exportToCSV(rows, "coding_profiles_report");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or Roll Number..."
                        className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        <option value="Computer Science (CSE)">CSE</option>
                        <option value="Electronics (ECE)">ECE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="AI-DS">AI-DS</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4 sticky left-0 bg-gray-50 z-10">Rank</th>
                                <th className="px-6 py-4 sticky left-[60px] bg-gray-50 z-10 w-64">Student</th>
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4 text-center border-l border-gray-100">
                                    HackerRank<br /><span className="text-[10px] text-gray-400">Score / Solved</span>
                                </th>
                                <th className="px-6 py-4 text-center border-l border-gray-100">
                                    LeetCode<br /><span className="text-[10px] text-gray-400">Rating / Solved</span>
                                </th>
                                <th className="px-6 py-4 text-center border-l border-gray-100">CodeChef<br /><span className="text-[10px] text-gray-400">Rating</span></th>
                                <th className="px-6 py-4 text-center border-l border-gray-100">CodeForces<br /><span className="text-[10px] text-gray-400">Rating</span></th>
                                <th className="px-6 py-4 text-center border-l border-gray-100 bg-indigo-50/50">Overall Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 font-medium text-gray-500">
                                            #{index + 1}
                                        </td>
                                        <td className="px-6 py-4 sticky left-[60px] bg-white group-hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {student.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        <Link href={`/students/${student.id}`}>{student.name}</Link>
                                                    </p>
                                                    <p className="text-xs text-gray-400">{student.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                                {student.department.split(' ')[0]}
                                            </span>
                                        </td>

                                        {/* HackerRank */}
                                        <td className="px-6 py-4 text-center border-l border-gray-100">
                                            <div className="font-medium text-gray-900">{student.coding_profile?.hackerrank_score || '-'}</div>
                                            <div className="text-xs text-gray-500">{student.coding_profile?.hackerrank_solved || 0} Solved</div>
                                        </td>

                                        {/* LeetCode */}
                                        <td className="px-6 py-4 text-center border-l border-gray-100">
                                            <div className="font-medium text-amber-600">{student.coding_profile?.leetcode_rating || '-'}</div>
                                            <div className="text-xs text-gray-500">{student.coding_profile?.leetcode_solved || 0} Solved</div>
                                        </td>

                                        {/* CodeChef */}
                                        <td className="px-6 py-4 text-center border-l border-gray-100 text-sm text-gray-700">
                                            {student.coding_profile?.codechef_rating || '-'}
                                        </td>

                                        {/* CodeForces */}
                                        <td className="px-6 py-4 text-center border-l border-gray-100 text-sm text-gray-700">
                                            {student.coding_profile?.codeforces_rating || '-'}
                                        </td>

                                        {/* Overall */}
                                        <td className="px-6 py-4 text-center border-l border-gray-100 bg-indigo-50/30 group-hover:bg-indigo-50/60 font-bold text-indigo-700">
                                            {student.coding_profile?.overall_score || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
