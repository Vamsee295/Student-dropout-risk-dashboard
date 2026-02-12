"use client";

import { InterventionColumn } from "./InterventionColumn";
import { InterventionCard, InterventionCardProps } from "./InterventionCard";

const pendingData: InterventionCardProps[] = [
    {
        id: "1",
        studentName: "Isabella Chen",
        studentInitial: "IC",
        studentId: "#9320",
        grade: "Grade 11",
        riskLevel: "High Risk",
        alertTitle: "Attendance dropped by 15%",
        alertDescription: "ML Model flagged unusual absence pattern in Science classes.",
        suggestedAction: "Schedule Counseling",
        status: "Pending",
    },
    {
        id: "2",
        studentName: "Marcus Johnson",
        studentInitial: "MJ",
        studentId: "#8841",
        grade: "Grade 10",
        riskLevel: "Medium Risk",
        alertTitle: "Math grade below threshold",
        alertDescription: "Consistent decline over last 3 weeks.",
        suggestedAction: "Peer Tutoring",
        status: "Pending",
    },
];

const inProgressData: InterventionCardProps[] = [
    {
        id: "3",
        studentName: "Sophia Williams",
        studentInitial: "SW",
        studentId: "#1029",
        grade: "Grade 12",
        riskLevel: "High Risk", // Logic can vary, keeping high for example
        alertTitle: "Risk Alert", // Can be generic or specific
        alertDescription: "",
        suggestedAction: "",
        actionPlan: "Weekly mentorship sessions",
        actionPlanDescription: "Focus on college application stress management.",
        assignedTo: "Mr. Davis",
        dueDate: "Next: Fri, 2pm",
        status: "In Progress",
    },
    {
        id: "4",
        studentName: "Elena Rodriguez",
        studentInitial: "ER",
        studentId: "#9921",
        grade: "Grade 11",
        riskLevel: "Medium Risk",
        alertTitle: "",
        alertDescription: "",
        suggestedAction: "",
        actionPlan: "Parent-Teacher Conference",
        actionPlanDescription: "Scheduled to discuss behavioral changes.",
        assignedTo: "Mrs. Admin",
        dueDate: "Pending Reply",
        status: "In Progress",
    },
];

const completedData: InterventionCardProps[] = [
    {
        id: "5",
        studentName: "James Wilson",
        studentInitial: "JW",
        studentId: "#7732",
        grade: "Grade 10",
        riskLevel: "Low Risk",
        alertTitle: "Financial Aid approved",
        alertDescription: "Student received requested materials grant.",
        suggestedAction: "",
        status: "Completed",
        resolvedDate: "Oct 12",
        resolvedBy: "Sarah Admin",
    },
    {
        id: "6",
        studentName: "Priya Patel",
        studentInitial: "PP",
        studentId: "#9112",
        grade: "Grade 11",
        riskLevel: "Low Risk",
        alertTitle: "Study plan created",
        alertDescription: "Student committed to 2hr/day focused study.",
        suggestedAction: "",
        status: "Completed",
        resolvedDate: "Oct 10",
        resolvedBy: "Mr. Davis",
    },
];

export function InterventionBoard() {
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
            <InterventionColumn title="Pending Actions" count={pendingData.length} color="orange">
                {pendingData.map((card) => (
                    <InterventionCard key={card.id} data={card} />
                ))}
            </InterventionColumn>

            <InterventionColumn title="In Progress" count={inProgressData.length} color="blue">
                {inProgressData.map((card) => (
                    <InterventionCard key={card.id} data={card} />
                ))}
            </InterventionColumn>

            <InterventionColumn title="Completed" count={completedData.length} color="emerald">
                {completedData.map((card) => (
                    <InterventionCard key={card.id} data={card} />
                ))}
            </InterventionColumn>
        </div>
    );
}
