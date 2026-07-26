/**
 * Student Service
 * ───────────────
 * Handles API calls for the Student Dashboard.
 */

import apiClient from '@/api/axios';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface StudentOverview {
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
  advisor: string | null;
  primaryRiskDriver: string | null;
}

export interface AssessmentInfo {
  id: number;
  course_id: string;
  course_name: string;
  title: string;
  total_marks: number;
  due_date: string | null;
  type: string;
}

export interface Assignment {
  id: number;
  assessment_id: number;
  assessment: AssessmentInfo;
  obtained_marks: number | null;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  submission_date: string | null;
}

export interface AssignmentProgress {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_percentage: number;
  overdue_count: number;
  assignments: Assignment[];
}

export interface RiskFeature {
  feature: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface RiskExplanation {
  risk_score: number;
  risk_level: string;
  top_factors: RiskFeature[];
}

export interface RiskDetails {
  id: number;
  risk_score: number;
  risk_level: string;
  risk_trend: string;
  risk_value: string;
  explanation: RiskExplanation | null;
}

export interface SubjectPerformance {
  course_id: string;
  course_name: string;
  credits: number;
  internal_marks: number | null;
  external_marks: number | null;
  total_marks: number | null;
  grade: string | null;
  attendance_percentage: number;
}

export interface SemesterPerformance {
  semester: number;
  gpa: number;
  subjects: SubjectPerformance[];
}

export interface AttendanceRecord {
  id: number;
  course_id: string;
  course_name: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface AttendanceTrend {
  week: string;
  value: number;
}

export interface MarksTrend {
  month: string;
  marks: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const studentService = {
  async getOverview(studentId: string): Promise<StudentOverview> {
    const { data } = await apiClient.get(`/student/${studentId}/overview`);
    return data;
  },

  async getAssignments(studentId: string): Promise<AssignmentProgress> {
    const { data } = await apiClient.get(`/student/${studentId}/assignments`);
    return data;
  },

  async getRisk(studentId: string): Promise<RiskDetails> {
    const { data } = await apiClient.get(`/student/${studentId}/risk`);
    return data;
  },

  async getPerformance(studentId: string): Promise<SemesterPerformance[]> {
    const { data } = await apiClient.get(`/student/${studentId}/performance`);
    return data;
  },

  async getAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const { data } = await apiClient.get(`/student/${studentId}/attendance`);
    return data;
  },

  async getAttendanceTrend(studentId: string): Promise<AttendanceTrend[]> {
    const { data } = await apiClient.get(`/student/${studentId}/attendance/trend`);
    return data;
  },

  async getMarksTrend(studentId: string): Promise<MarksTrend[]> {
    const { data } = await apiClient.get(`/student/${studentId}/marks-trend`);
    return data;
  },
};
