/**
 * Dean Service
 * ────────────
 * Unified data layer for Dean/Admin dashboard endpoints.
 */

import apiClient from '@/api/axios';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface KpiOverview {
  total_students: number;
  overall_attendance: number;
  average_risk_score: number;
  dropout_rate_ytd: number;
  students_at_risk: number;
  interventions_active: number;
  trend_attendance: 'up' | 'down' | 'stable';
  trend_risk: 'up' | 'down' | 'stable';
}

export interface DeanOverview {
  total_students: number;
  total_departments: number;
  total_faculty: number;
  dropout_rate: number;
  retention_rate: number;
  graduation_rate: number;
  placement_rate: number;
  avg_attendance: number;
  average_risk_score: number;
  students_at_risk: number;
  interventions_active: number;
  critical_alerts: number;
  warning_alerts: number;
}

export interface DepartmentRow {
  dept: string;
  department: string;
  total_students: number;
  avg_risk_score: number;
  avg_attendance: number;
  high_risk_count: number;
  cgpa: number;
  risk: number; // same as avg_risk_score for UI convenience
}

export interface FacultyPerformance {
  faculty_id: string;
  name: string;
  avg_gpa: number;
  avg_risk: number;
  avg_attendance: number;
  students_count: number;
}

export interface AcademicTrends {
  pass_fail: { pass: number; fail: number };
  backlog_count: number;
  backlog_rate: number;
  gpa_trend: Array<{ month: string; avg_gpa: number }>;
  gpa_distribution: Array<{ range: string; count: number }>;
  gpa_risk_scatter: Array<{ gpa: number; risk: number }>;
}

export interface EngagementData {
  avg_attendance: number;
  avg_engagement: number;
  low_attendance_count: number;
  low_attendance_pct: number;
  avg_login_gap_days: number;
  attendance_distribution: Array<{ range: string; count: number }>;
  department_engagement: Array<{ department: string; avg_engagement: number; avg_attendance: number }>;
  attendance_risk_scatter: Array<{ attendance: number; risk: number }>;
}

export interface InterventionStats {
  total_interventions: number;
  resolution_rate: number;
  status_distribution: Record<string, number>;
  type_distribution: Record<string, number>;
  pending_by_faculty: Array<{ faculty_id: string; count: number }>;
}

export interface PredictiveInsight {
  projected_dropout_rate: number;
  model_accuracy_note: string;
  top_risk_factors: Array<{ feature: string; importance: number }>;
  risk_curve: Array<{ risk_bucket: string; student_count: number }>;
}

export interface ActiveAlert {
  severity: 'critical' | 'warning' | 'info';
  dept: string;
  issue: string;
  action: string;
}

export interface DropoutTrend {
  month: string;
  rate: number;
}

export interface RetentionTrend {
  sem: string;
  retention: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface ReportRow {
  id: number;
  student_id: string;
  student_name: string;
  department: string;
  risk_score: number;
  attendance: number;
  gpa: number;
  status: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const deanService = {
  async getOverview(): Promise<DeanOverview> {
    const { data } = await apiClient.get('/dean/overview');
    return data;
  },

  async getKpiOverview(): Promise<KpiOverview> {
    const { data } = await apiClient.get('/analytics/dean/kpis');
    return data;
  },

  async getDepartmentAnalytics(): Promise<DepartmentRow[]> {
    const { data } = await apiClient.get('/dean/departments');
    return data;
  },

  async getFacultyPerformance(): Promise<FacultyPerformance[]> {
    const { data } = await apiClient.get('/dean/faculty/performance');
    return data;
  },

  async getAcademicTrends(): Promise<AcademicTrends> {
    const { data } = await apiClient.get('/dean/academic-trends');
    return data;
  },

  async getEngagementAttendance(): Promise<EngagementData> {
    const { data } = await apiClient.get('/dean/engagement');
    return data;
  },

  async getInterventions(): Promise<InterventionStats> {
    const { data } = await apiClient.get('/dean/interventions');
    return data;
  },

  async getPredictiveInsights(): Promise<PredictiveInsight> {
    const { data } = await apiClient.get('/dean/predictive-insights');
    return data;
  },

  async getDropoutTrend(): Promise<DropoutTrend[]> {
    const { data } = await apiClient.get('/dean/dropout-trend');
    return data;
  },

  async getRetentionTrend(): Promise<RetentionTrend[]> {
    const { data } = await apiClient.get('/dean/retention-trend');
    return data;
  },

  async getRiskDistribution(): Promise<RiskDistribution[]> {
    const { data } = await apiClient.get('/dean/risk-distribution');
    return data;
  },

  async getActiveAlerts(): Promise<ActiveAlert[]> {
    const { data } = await apiClient.get('/dean/alerts');
    return data;
  },

  async getReportsSummary(params?: { department?: string; semester?: string }): Promise<ReportRow[]> {
    const { data } = await apiClient.get('/dean/reports', { params });
    return data;
  },
};
