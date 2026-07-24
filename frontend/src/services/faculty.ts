import apiClient from '@/lib/api';
import { studentService, type StudentOverview, type AssignmentProgress, type RiskDetails } from './student';

export interface FacultyOverview {
    total_students: number;
    high_risk_count: number;
    high_risk_percentage: number;
    average_attendance: number;
    average_risk_score: number;
    high_risk_department: string | null;
    risk_distribution: Record<string, number>;
}

export interface StudentSummary {
    id: string;
    name: string;
    department: string;
    risk_level: string;
    risk_score: number;
    attendance: number;
    engagement: number;
}

export interface AnalyticsData {
    department_risks: {
        department: string;
        avg_risk: number;
        student_count: number;
    }[];
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals: number = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const facultyService = {
    getOverview: async (): Promise<FacultyOverview> => {
        await delay(300);
        return {
            total_students: 450,
            high_risk_count: 32,
            high_risk_percentage: 7.1,
            average_attendance: randFloat(75, 95, 1),
            average_risk_score: randFloat(30, 50, 1),
            high_risk_department: "Computer Science",
            risk_distribution: {
                "High Risk": 32,
                "Moderate Risk": 85,
                "Stable": 142,
                "Safe": 191
            }
        };
    },

    getStudents: async (department?: string, riskLevel?: string): Promise<StudentSummary[]> => {
        await delay(400);
        return Array.from({ length: 15 }, (_, i) => ({
            id: `S${1000 + i}`,
            name: `Student ${i + 1}`,
            department: department || randChoice(["CS", "EC", "ME", "CE"]),
            risk_level: riskLevel || randChoice(["High", "Moderate", "Stable", "Safe"]),
            risk_score: randInt(10, 95),
            attendance: randInt(60, 100),
            engagement: randInt(40, 100)
        }));
    },

    getAnalytics: async (): Promise<AnalyticsData> => {
        await delay(500);
        return {
            department_risks: [
                { department: "CS", avg_risk: randFloat(35, 55), student_count: 120 },
                { department: "EC", avg_risk: randFloat(25, 45), student_count: 110 },
                { department: "ME", avg_risk: randFloat(20, 35), student_count: 105 },
                { department: "CE", avg_risk: randFloat(40, 60), student_count: 115 }
            ]
        };
    },

    uploadData: async (dataType: 'attendance' | 'marks' | 'assignments', file: File): Promise<{ message: string }> => {
        await delay(1000);
        return { message: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data uploaded successfully and is being processed.` };
    },

    recalculateRisk: async (): Promise<{ message: string }> => {
        await delay(1500);
        return { message: "Risk scores recalculated successfully based on the latest student behavior data." };
    },

    async getCodingReports(department?: string): Promise<StudentCodingStats[]> {
        await delay(600);
        return Array.from({ length: 10 }, (_, i) => ({
            id: `S${2000 + i}`,
            name: `Coder ${i + 1}`,
            avatar: String.fromCharCode(65 + i),
            course: "B.Tech",
            department: department || "Computer Science",
            section: "A",
            riskStatus: randChoice(["Critical", "Elevated", "Low"]),
            riskTrend: randChoice(["UP", "DOWN", "STABLE"]),
            riskValue: `${randInt(10, 95)}%`,
            attendance: randInt(70, 100),
            engagementScore: randInt(50, 100),
            lastInteraction: "2 days ago",
            coding_profile: {
                hackerrank_score: randInt(500, 2000),
                hackerrank_solved: randInt(50, 200),
                leetcode_rating: randInt(1400, 2500),
                leetcode_solved: randInt(100, 1000),
                codechef_rating: randInt(1200, 2400),
                codeforces_rating: randInt(1000, 2200),
                interviewbit_score: randInt(1000, 5000),
                spoj_score: randInt(200, 800),
                overall_score: randInt(60, 100)
            }
        }));
    },

    getStudentDetails: async (studentId: string) => {
        const [overview, risk] = await Promise.all([
            studentService.getOverview(studentId),
            studentService.getRisk(studentId)
        ]);
        return { overview, risk };
    }
};

export interface CodingProfile {
    hackerrank_score: number;
    hackerrank_solved: number;
    leetcode_rating: number;
    leetcode_solved: number;
    codechef_rating: number;
    codeforces_rating: number;
    interviewbit_score: number;
    spoj_score: number;
    overall_score: number;
}

export interface StudentCodingStats {
    id: string;
    name: string;
    avatar: string;
    course: string;
    department: string;
    section: string;
    riskStatus: string;
    riskTrend: string;
    riskValue: string;
    attendance: number;
    engagementScore: number;
    lastInteraction: string;
    coding_profile: CodingProfile | null;
}
