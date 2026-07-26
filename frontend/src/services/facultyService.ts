/**
 * Faculty Service
 * ───────────────
 * Single data layer for all faculty dashboard pages.
 */

import apiClient from '@/api/axios';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface FacultyOverview {
  faculty_id: string;
  faculty_name: string;
  total_students: number;
  high_risk_count: number;
  high_risk_percentage: number;
  average_attendance: number;
  average_risk_score: number;
  high_risk_department: string | null;
  classes_today: number;
  pending_tasks: number;
  risk_distribution: Record<string, number>;
}

export interface StudentSummary {
  id: string;
  name: string;
  roll: string;
  department: string;
  risk_level: 'High' | 'Moderate' | 'Stable' | 'Safe';
  risk_score: number;
  attendance: number;
  engagement: number;
  last_interaction: string;
}

export interface DeptAnalytics {
  department: string;
  avg_risk: number;
  student_count: number;
  avg_attendance: number;
}

export interface WeeklyActivity {
  day: string;
  submissions: number;
  attendance: number;
}

export interface AttendanceTrendPoint {
  week: string;
  attendance: number;
}

export interface PendingTask {
  task: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
  due: string;
}

export interface TodayClass {
  time: string;
  subject: string;
  room: string;
  students: number;
}

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

// ─── Service ──────────────────────────────────────────────────────────────────

export const facultyService = {
  async getOverview(facultyId = 'current'): Promise<FacultyOverview> {
    const { data } = await apiClient.get(`/faculty/${facultyId}/overview`);
    return data;
  },

  async getStudents(filters?: { department?: string; riskLevel?: string }): Promise<StudentSummary[]> {
    const { data } = await apiClient.get('/faculty/students', { params: filters });
    return data;
  },

  async getAtRiskStudents(): Promise<StudentSummary[]> {
    const { data } = await apiClient.get('/faculty/students/at-risk');
    return data;
  },

  async getDeptAnalytics(): Promise<DeptAnalytics[]> {
    const { data } = await apiClient.get('/faculty/analytics/departments');
    return data;
  },

  async getWeeklyActivity(): Promise<WeeklyActivity[]> {
    const { data } = await apiClient.get('/faculty/analytics/weekly-activity');
    return data;
  },

  async getAttendanceTrend(): Promise<AttendanceTrendPoint[]> {
    const { data } = await apiClient.get('/faculty/analytics/attendance-trend');
    return data;
  },

  async getTodayClasses(): Promise<TodayClass[]> {
    const { data } = await apiClient.get('/faculty/schedule/today');
    return data;
  },

  async getPendingTasks(): Promise<PendingTask[]> {
    const { data } = await apiClient.get('/faculty/tasks/pending');
    return data;
  },

  async getCodingStats(department?: string): Promise<StudentCodingStats[]> {
    const { data } = await apiClient.get('/faculty/students/coding-stats', { params: { department } });
    return data;
  },

  async uploadData(dataType: 'attendance' | 'marks' | 'assignments', file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data_type', dataType);
    const { data } = await apiClient.post('/faculty/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async recalculateRisk(): Promise<{ message: string }> {
    const { data } = await apiClient.post('/faculty/risk/recalculate');
    return data;
  },

  async submitIntervention(studentId: string, details: Record<string, unknown>): Promise<{ message: string }> {
    const { data } = await apiClient.post(`/faculty/students/${studentId}/intervention`, details);
    return data;
  },
};
