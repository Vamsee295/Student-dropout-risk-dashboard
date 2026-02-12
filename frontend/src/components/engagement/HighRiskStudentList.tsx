"use client";

import Link from "next/link";

const students = [
    { id: "8821", name: "Sarah J.", avatar: "https://ui-avatars.com/api/?name=Sarah+J&background=random", risk: 92 },
    { id: "9932", name: "Mike T.", avatar: "https://ui-avatars.com/api/?name=Mike+T&background=random", risk: 88 },
    { id: "7741", name: "Jessica L.", avatar: "https://ui-avatars.com/api/?name=Jessica+L&background=random", risk: 85 },
    { id: "5521", name: "Tom H.", avatar: "https://ui-avatars.com/api/?name=Tom+H&background=random", risk: 78 },
];

export function HighRiskStudentList() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <h3 className="font-bold text-gray-900">High Risk Students</h3>
                </div>
                <Link href="/risk-analysis" className="text-xs font-semibold text-blue-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-400 pb-2 border-b border-gray-50">
                    <span className="col-span-6">Student</span>
                    <span className="col-span-3 text-center">Risk</span>
                    <span className="col-span-3 text-right">Action</span>
                </div>

                {students.map((student) => (
                    <div key={student.id} className="grid grid-cols-12 items-center">
                        <div className="col-span-6 flex items-center gap-3">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full bg-gray-100" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-xs">{student.name}</h4>
                                <p className="text-[10px] text-gray-500">ID: #{student.id}</p>
                            </div>
                        </div>
                        <div className="col-span-3 text-center">
                            <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                {student.risk}%
                            </span>
                        </div>
                        <div className="col-span-3 text-right">
                            <button className="px-2 py-1 rounded border border-blue-200 text-blue-600 text-[10px] font-bold hover:bg-blue-50">
                                Intervene
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
