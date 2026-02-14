import axios from 'axios';
import { studentService, type StudentOverview, type AssignmentProgress, type RiskDetails } from './student';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface FacultyOverview {
    total_students: number;
    high_risk_count: number;
    average_attendance: number;
    average_risk_score: number;
    high_risk_department: string;
    risk_distribution: {
        low: number;
        medium: number;
        high: number;
    };
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

export const facultyService = {
    getOverview: async (): Promise<FacultyOverview> => {
        const response = await axios.get(`${API_URL}/faculty/overview`);
        return response.data;
    },

    getStudents: async (department?: string, riskLevel?: string): Promise<StudentSummary[]> => {
        const params: any = {};
        if (department) params.department = department;
        if (riskLevel) params.risk_level = riskLevel;

        const response = await axios.get(`${API_URL}/faculty/students`, { params });
        return response.data;
    },

    getAnalytics: async (): Promise<AnalyticsData> => {
        const response = await axios.get(`${API_URL}/faculty/analytics/department`);
        return { department_risks: response.data };
    },

    uploadData: async (dataType: 'attendance' | 'marks' | 'assignments', file: File): Promise<{ message: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/faculty/upload/${dataType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    recalculateRisk: async (): Promise<{ message: string }> => {
        const response = await axios.post(`${API_URL}/faculty/recalculate`);
        return response.data;
    },

    async getCodingReports(department?: string): Promise<StudentCodingStats[]> {
        const params = new URLSearchParams();
        if (department) params.append('department', department);
        const response = await axios.get(`${API_URL}/faculty/reports/coding`, { params });
        return response.data;
    },

    // Reuse student service for individual student details
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

