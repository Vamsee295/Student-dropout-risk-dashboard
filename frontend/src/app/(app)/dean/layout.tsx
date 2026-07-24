"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DeanContextType {
    semester: string;
    setSemester: (s: string) => void;
    department: string;
    setDepartment: (d: string) => void;
}

const DeanContext = createContext<DeanContextType>({
    semester: "all",
    setSemester: () => { },
    department: "all",
    setDepartment: () => { },
});

export const useDeanFilter = () => useContext(DeanContext);

export default function DeanLayout({ children }: { children: ReactNode }) {
    const [semester, setSemester] = useState("all");
    const [department, setDepartment] = useState("all");

    return (
        <DeanContext.Provider value={{ semester, setSemester, department, setDepartment }}>
            <div className="space-y-0">
                {/* Global Filter Bar */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                    <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider mr-2">Global Filters</span>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="text-sm border border-violet-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    >
                        <option value="all">All Semesters</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                    </select>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="text-sm border border-violet-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    >
                        <option value="all">All Departments</option>
                        <option value="Computer Science (CSE)">CSE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Aerospace">Aerospace</option>
                        <option value="Data Science">Data Science</option>
                        <option value="AI-DS">AI-DS</option>
                        <option value="Civil">Civil</option>
                        <option value="Electronics (ECE)">ECE</option>
                    </select>
                    {(semester !== "all" || department !== "all") && (
                        <button
                            onClick={() => { setSemester("all"); setDepartment("all"); }}
                            className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
                {children}
            </div>
        </DeanContext.Provider>
    );
}
