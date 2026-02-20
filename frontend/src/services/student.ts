import apiClient from '@/lib/api';

export interface StudentOverview {
    attendance_rate: number;
    avg_marks: number;
    engagement_score: number;
    risk_level: string;
    risk_trend: string;
    risk_value: string;
    dropout_probability: number;
    upcoming_deadlines: {
        id: number;
        course_id: string;
        course_name: string;
        title: string;
        due_date: string;
        type: string;
    }[];
    recent_attendance: {
        id: number;
        course_name: string;
        date: string;
        status: string;
    }[];
}

export interface AssignmentProgress {
    total: number;
    completed: number;
    pending: number;
    completion_percentage: number;
    overdue_count: number;
    assignments: {
        id: number;
        assessment_id: number;
        assessment: {
            id: number;
            course_id: string;
            course_name: string;
            title: string;
            total_marks: number;
            due_date: string;
            type: string;
        };
        obtained_marks: number | null;
        status: string;
        submission_date: string | null;
    }[];
}

export interface RiskDetails {
    id: number;
    risk_score: number;
    risk_level: string;
    risk_trend: string;
    risk_value: string;
    explanation: {
        risk_score: number;
        risk_level: string;
        top_factors: {
            feature: string;
            impact: number;
            direction: string;
        }[];
    } | null;
}

export const studentService = {
    getOverview: async (studentId: string): Promise<StudentOverview> => {
        const response = await apiClient.get(`/student/${studentId}/overview`);
        return response.data;
    },

    getPerformance: async (studentId: string) => {
        const response = await apiClient.get(`/student/${studentId}/performance`);
        return response.data;
    },

    getAttendance: async (studentId: string) => {
        const response = await apiClient.get(`/student/${studentId}/attendance`);
        return response.data;
    },

    getAssignments: async (studentId: string): Promise<AssignmentProgress> => {
        const response = await apiClient.get(`/student/${studentId}/assignments`);
        return response.data;
    },

    getRisk: async (studentId: string): Promise<RiskDetails> => {
        const response = await apiClient.get(`/student/${studentId}/risk`);
        return response.data;
    }
};
