"use client";

import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { CourseCard, CourseCardProps } from "./CourseCard";

const courses: CourseCardProps[] = [
    {
        id: "1",
        name: "Intro to Macroeconomics",
        code: "ECON 101",
        professor: "Prof. Sarah Jenkins",
        riskStatus: "Red Flag",
        riskRate: "24%",
        avgAttendance: "65%",
        avgGrade: "1.8",
    },
    {
        id: "2",
        name: "Computer Science 101",
        code: "CS 101",
        professor: "Prof. Alan Turing",
        riskStatus: "Red Flag",
        riskRate: "21%",
        avgAttendance: "72%",
        avgGrade: "2.5",
    },
    {
        id: "3",
        name: "Linear Algebra",
        code: "MATH 201",
        professor: "Prof. John Doe",
        riskStatus: "Warning",
        riskRate: "15%",
        avgAttendance: "78%",
        avgGrade: "2.9",
    },
    {
        id: "4",
        name: "Physics I",
        code: "PHYS 101",
        professor: "Prof. Albert",
        riskStatus: "Stable",
        riskRate: "5%",
        avgAttendance: "92%",
        avgGrade: "3.8",
    },
];

export function CourseList() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Detailed Course Breakdown</h3>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        Sort by: Highest Risk
                        <ChevronDown size={14} />
                    </button>
                    <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                            <LayoutGrid size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course) => (
                    <CourseCard key={course.id} data={course} />
                ))}
            </div>
        </div>
    );
}
