import apiClient from '@/lib/api';

export interface Student {
    id: string;
    name: string;
    avatar: string;
    course: string;
    department: "Computer Science (CSE)" | "Mechanical" | "Aerospace" | "Data Science" | "AI-DS" | "Civil" | "Electronics (ECE)";
    section: "A" | "B" | "C";
    riskStatus: "High Risk" | "Moderate Risk" | "Stable" | "Safe";
    riskTrend: "up" | "down" | "stable";
    riskValue: string;
    attendance: number;
    engagementScore: number;
    lastInteraction: string;
    advisor?: string;
}

/**
 * Fetch all students from the backend API.
 * Uses the /api/students/all endpoint (served by frontend.py router).
 */
export async function fetchStudents(): Promise<Student[]> {
    try {
        const response = await apiClient.get('/students/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching students from API:', error);
        return [];
    }
}

/**
 * Fetch a single student by ID.
 */
export async function getStudentById(id: string): Promise<Student | null> {
    try {
        const response = await apiClient.get(`/students/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching student ${id}:`, error);
        return null;
    }
}
