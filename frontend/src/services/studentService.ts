// API service for fetching student data from backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
 * Fetch all students from the backend API
 */
export async function fetchStudents(): Promise<Student[]> {
    try {
        const response = await fetch(`${API_URL}/api/students/all`);

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching students from API:', error);
        // Return empty array on error - you can also return mock data as fallback
        return [];
    }
}

/**
 * Fetch a single student by ID
 */
export async function getStudentById(id: string): Promise<Student | null> {
    try {
        const response = await fetch(`${API_URL}/api/students/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch student: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching student ${id}:`, error);
        return null;
    }
}
