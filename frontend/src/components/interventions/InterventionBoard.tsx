"use client";

import { InterventionCard, type InterventionData } from "./InterventionCard";

const MOCK_DATA: InterventionData[] = [
    // Pending
    {
        id: "1",
        studentName: "Isabella Chen",
        studentId: "#9320",
        grade: "11",
        riskLevel: "High",
        status: "Pending",
        title: "Attendance dropped by 15%",
        description: "ML Model flagged unusual absence pattern in Science classes.",
        meta: { suggestion: "Schedule Counseling" },
    },
    {
        id: "2",
        studentName: "Marcus Johnson",
        studentId: "#8841",
        grade: "10",
        riskLevel: "Medium",
        status: "Pending",
        title: "Math grade below threshold",
        description: "Consistent decline over last 3 weeks.",
        meta: { suggestion: "Peer Tutoring" },
    },
    // In Progress
    {
        id: "3",
        studentName: "Sophia Williams",
        studentId: "#1029",
        grade: "12",
        riskLevel: "Medium", // Badge hidden if desired, but data kept
        status: "In Progress",
        title: "Weekly mentorship sessions",
        description: "Focus on college application stress management.",
        meta: { owner: "Mr. Davis", date: "Next: Fri, 2pm" },
    },
    {
        id: "4",
        studentName: "Elena Rodriguez",
        studentId: "#9921",
        grade: "11",
        riskLevel: "High",
        status: "In Progress",
        title: "Parent-Teacher Conference",
        description: "Scheduled to discuss behavioral changes.",
        meta: { owner: "Mrs. Admin", date: "Pending Reply" },
    },
    // Completed
    {
        id: "5",
        studentName: "James Wilson",
        studentId: "#7732",
        grade: "10",
        riskLevel: "Low",
        status: "Completed",
        title: "Financial Aid approved",
        description: "Student received requested materials grant.",
        meta: { date: "Oct 12", owner: "Sarah Admin" },
    },
    {
        id: "6",
        studentName: "Priya Patel",
        studentId: "#9112",
        grade: "11",
        riskLevel: "Medium",
        status: "Completed",
        title: "Study plan created",
        description: "Student committed to 2hr/day focused study.",
        meta: { date: "Oct 10", owner: "Mr. Davis" },
    },
];

export function InterventionBoard() {
    const pendingItems = MOCK_DATA.filter(i => i.status === "Pending");
    const progressItems = MOCK_DATA.filter(i => i.status === "In Progress");
    const completedItems = MOCK_DATA.filter(i => i.status === "Completed");

    return (
        <div className="grid h-full gap-6 lg:grid-cols-3">
            {/* Pending Column */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <h3 className="font-bold text-slate-800">Pending Actions</h3>
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{pendingItems.length}</span>
                </div>
                <div className="flex flex-col gap-4">
                    {pendingItems.map(item => <InterventionCard key={item.id} data={item} />)}
                </div>
            </div>

            {/* In Progress Column */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <h3 className="font-bold text-slate-800">In Progress</h3>
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{progressItems.length}</span>
                </div>
                <div className="flex flex-col gap-4">
                    {progressItems.map(item => <InterventionCard key={item.id} data={item} />)}
                </div>
            </div>

            {/* Completed Column */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-slate-800">Completed</h3>
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{completedItems.length}</span>
                </div>
                <div className="flex flex-col gap-4">
                    {completedItems.map(item => <InterventionCard key={item.id} data={item} />)}
                </div>
            </div>
        </div>
    );
}
