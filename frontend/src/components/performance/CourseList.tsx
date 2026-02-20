"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { CourseCard, CourseCardProps } from "./CourseCard";
import apiClient from "@/lib/api";

export function CourseList() {
    const [courses, setCourses] = useState<CourseCardProps[]>([]);

    useEffect(() => {
        apiClient.get("/performance/course-detail").then((res) => {
            const mapped: CourseCardProps[] = (res.data.courses ?? []).map(
                (course: { course_id: string; course_name: string; credits: number; attendance_pct: number; overall_grade: number }) => ({
                    id: course.course_id,
                    name: course.course_name,
                    code: course.course_id,
                    professor: course.course_name.split(" ")[0] + " Dept",
                    riskStatus: course.overall_grade < 50 ? "Red Flag" : course.overall_grade < 70 ? "Warning" : "Stable",
                    riskRate: `${Math.round(100 - course.overall_grade)}%`,
                    avgAttendance: `${course.attendance_pct}%`,
                    avgGrade: (course.overall_grade / 25).toFixed(1),
                })
            );
            setCourses(mapped);
        }).catch((err) => {
            console.error("Failed to fetch course details:", err);
        });
    }, []);
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
