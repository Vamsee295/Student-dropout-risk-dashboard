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

export const facultyService = {
    getOverview: async (): Promise<FacultyOverview> => {
        const response = await apiClient.get('/faculty/overview');
        return response.data;
    },

    getStudents: async (department?: string, riskLevel?: string): Promise<StudentSummary[]> => {
        const params: Record<string, string> = {};
        if (department) params.department = department;
        if (riskLevel) params.risk_level = riskLevel;

        const response = await apiClient.get('/faculty/students', { params });

        const rawItems = response.data.items || (Array.isArray(response.data) ? response.data : []);

        return rawItems.map((s: Record<string, unknown>) => ({
            id: s.id,
            name: s.name,
            department: s.department,
            risk_level: s.risk_level,
            risk_score: s.risk_score,
            attendance: s.attendance_rate ?? s.attendance ?? 0,
            engagement: s.engagement_score ?? s.engagement ?? 0
        }));
    },

    getAnalytics: async (): Promise<AnalyticsData> => {
        const response = await apiClient.get('/faculty/analytics/department');
        return { department_risks: response.data };
    },

    uploadData: async (dataType: 'attendance' | 'marks' | 'assignments', file: File): Promise<{ message: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/faculty/upload/${dataType}`, formData);
        return response.data;
    },

    recalculateRisk: async (): Promise<{ message: string }> => {
        const response = await apiClient.post('/faculty/recalculate');
        return response.data;
    },

    async getCodingReports(department?: string): Promise<StudentCodingStats[]> {
        const params = new URLSearchParams();
        if (department) params.append('department', department);
        const response = await apiClient.get('/faculty/reports/coding', { params });
        return response.data;
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
