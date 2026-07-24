const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals: number = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const deanService = {
    getOverview: async () => {
        await delay(300);
        return {
            total_students: 1240,
            high_risk_count: 86,
            average_attendance: randFloat(78, 92, 1),
            average_risk_score: randFloat(25, 45, 1),
            high_risk_department: "Computer Science",
            risk_distribution: {
                "High Risk": 86,
                "Moderate Risk": 245,
                "Stable": 412,
                "Safe": 497
            }
        };
    },

    getDepartmentAnalytics: async () => {
        await delay(400);
        return [
            { department: "Computer Science", total_students: 450, avg_risk_score: randFloat(35, 55), avg_attendance: randFloat(80, 95), high_risk_count: 32 },
            { department: "Electronics", total_students: 320, avg_risk_score: randFloat(25, 45), avg_attendance: randFloat(82, 92), high_risk_count: 18 },
            { department: "Mechanical", total_students: 280, avg_risk_score: randFloat(20, 35), avg_attendance: randFloat(85, 96), high_risk_count: 12 },
            { department: "Civil", total_students: 190, avg_risk_score: randFloat(40, 60), avg_attendance: randFloat(75, 88), high_risk_count: 24 }
        ];
    },

    getFacultyPerformance: async () => {
        await delay(500);
        return [
            { faculty_id: "F001", name: "Dr. Sarah Jenkins", avg_gpa: randFloat(7.5, 9.2), avg_risk: randFloat(15, 30), avg_attendance: randFloat(88, 98), students_count: 120 },
            { faculty_id: "F002", name: "Prof. Michael Chen", avg_gpa: randFloat(6.8, 8.5), avg_risk: randFloat(25, 45), avg_attendance: randFloat(82, 92), students_count: 95 },
            { faculty_id: "F003", name: "Dr. Emily Rodriguez", avg_gpa: randFloat(7.2, 8.8), avg_risk: randFloat(20, 35), avg_attendance: randFloat(85, 95), students_count: 110 },
            { faculty_id: "F004", name: "Prof. James Wilson", avg_gpa: randFloat(6.5, 8.2), avg_risk: randFloat(30, 50), avg_attendance: randFloat(78, 88), students_count: 85 }
        ];
    },

    getAcademicTrends: async () => {
        await delay(450);
        return {
            pass_fail: { pass: 1120, fail: 120 },
            backlog_count: 95,
            backlog_rate: 7.6,
            gpa_trend: [
                { month: "Sem 1", avg_gpa: 7.2 },
                { month: "Sem 2", avg_gpa: 7.5 },
                { month: "Sem 3", avg_gpa: 7.4 },
                { month: "Sem 4", avg_gpa: 7.8 },
                { month: "Sem 5", avg_gpa: 8.1 }
            ],
            gpa_distribution: [
                { range: "0-4", count: 12 },
                { range: "4-6", count: 145 },
                { range: "6-8", count: 680 },
                { range: "8-10", count: 403 }
            ],
            gpa_risk_scatter: Array.from({ length: 50 }, () => ({
                gpa: randFloat(4, 10),
                risk: randFloat(0, 100)
            }))
        };
    },

    getEngagementAttendance: async () => {
        await delay(400);
        return {
            avg_attendance: 86.4,
            avg_engagement: 74.2,
            low_attendance_count: 156,
            low_attendance_pct: 12.5,
            avg_login_gap_days: 2.4,
            attendance_distribution: [
                { range: "0-60%", count: 45 },
                { range: "60-75%", count: 180 },
                { range: "75-90%", count: 520 },
                { range: "90-100%", count: 495 }
            ],
            department_engagement: [
                { department: "CS", avg_engagement: 82, avg_attendance: 88 },
                { department: "EC", avg_engagement: 75, avg_attendance: 85 },
                { department: "ME", avg_engagement: 68, avg_attendance: 82 },
                { department: "CE", avg_engagement: 72, avg_attendance: 84 }
            ],
            attendance_risk_scatter: Array.from({ length: 50 }, () => ({
                attendance: randFloat(40, 100),
                risk: randFloat(0, 100)
            }))
        };
    },

    getInterventions: async () => {
        await delay(500);
        return {
            total_interventions: 342,
            resolution_rate: 78,
            status_distribution: {
                "Pending": 45,
                "In Progress": 86,
                "Completed": 198,
                "Failed": 13
            },
            type_distribution: {
                "Warning Letter": 120,
                "Counseling": 85,
                "Meeting": 92,
                "Tutoring": 45
            },
            pending_by_faculty: [
                { faculty_id: "F001", count: 12 },
                { faculty_id: "F002", count: 18 },
                { faculty_id: "F003", count: 8 },
                { faculty_id: "F004", count: 7 }
            ]
        };
    },

    getPredictiveInsights: async () => {
        await delay(600);
        return {
            projected_dropout_rate: randFloat(8, 15, 1),
            model_accuracy_note: "Model accuracy: 94.2% based on last semester validation",
            top_risk_factors: [
                { feature: "attendance_rate", importance: 0.42 },
                { feature: "gpa_current", importance: 0.35 },
                { feature: "assignment_completion", importance: 0.28 },
                { feature: "lms_engagement", importance: 0.15 },
                { feature: "previous_backlogs", importance: 0.12 }
            ],
            risk_curve: [
                { risk_bucket: "0-20%", student_count: 450 },
                { risk_bucket: "20-40%", student_count: 320 },
                { risk_bucket: "40-60%", student_count: 210 },
                { risk_bucket: "60-80%", student_count: 140 },
                { risk_bucket: "80-100%", student_count: 120 }
            ]
        };
    },

    getReportsSummary: async (params?: { department?: string; semester?: string }) => {
        await delay(700);
        return Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            student_id: `S${1000 + i}`,
            student_name: `Student ${i + 1}`,
            department: randChoice(["Computer Science", "Electronics", "Mechanical", "Civil"]),
            risk_score: randInt(10, 95),
            attendance: randInt(60, 100),
            gpa: randFloat(5, 9.5),
            status: randChoice(["Active", "At Risk", "Under Monitoring"])
        }));
    },
};
