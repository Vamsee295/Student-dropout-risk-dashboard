/**
 * useFaculty — Custom hook for Faculty Dashboard data
 *
 * Usage:
 *   const { overview, atRiskStudents, isLoading, error, refetch } = useFaculty();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  facultyService,
  type FacultyOverview,
  type StudentSummary,
  type DeptAnalytics,
  type WeeklyActivity,
  type AttendanceTrendPoint,
  type PendingTask,
  type TodayClass,
  type StudentCodingStats,
} from '@/services/facultyService';

interface UseFacultyState {
  overview: FacultyOverview | null;
  students: StudentSummary[] | null;
  atRiskStudents: StudentSummary[] | null;
  deptAnalytics: DeptAnalytics[] | null;
  weeklyActivity: WeeklyActivity[] | null;
  attendanceTrend: AttendanceTrendPoint[] | null;
  todayClasses: TodayClass[] | null;
  pendingTasks: PendingTask[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => void;
  submitIntervention: (studentId: string, details: Record<string, unknown>) => Promise<{ message: string }>;
  refreshStudents: (filters?: { department?: string; riskLevel?: string }) => Promise<void>;
}

export function useFaculty(): UseFacultyState {
  const { user } = useAuthStore();
  const facultyId = user?.id ? String(user.id) : 'current';

  const [overview, setOverview] = useState<FacultyOverview | null>(null);
  const [students, setStudents] = useState<StudentSummary[] | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentSummary[] | null>(null);
  const [deptAnalytics, setDeptAnalytics] = useState<DeptAnalytics[] | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[] | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrendPoint[] | null>(null);
  const [todayClasses, setTodayClasses] = useState<TodayClass[] | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        facultyService.getOverview(facultyId),
        facultyService.getStudents(),
        facultyService.getAtRiskStudents(),
        facultyService.getDeptAnalytics(),
        facultyService.getWeeklyActivity(),
        facultyService.getAttendanceTrend(),
        facultyService.getTodayClasses(),
        facultyService.getPendingTasks(),
      ]);

      const [ov, stdts, atRisk, dept, weekly, atTrend, classes, tasks] = results;

      if (ov.status === 'fulfilled') setOverview(ov.value);
      else throw new Error(ov.reason?.message || 'Failed to load faculty overview');

      if (stdts.status === 'fulfilled') setStudents(stdts.value);
      if (atRisk.status === 'fulfilled') setAtRiskStudents(atRisk.value);
      if (dept.status === 'fulfilled') setDeptAnalytics(dept.value);
      if (weekly.status === 'fulfilled') setWeeklyActivity(weekly.value);
      if (atTrend.status === 'fulfilled') setAttendanceTrend(atTrend.value);
      if (classes.status === 'fulfilled') setTodayClasses(classes.value);
      if (tasks.status === 'fulfilled') setPendingTasks(tasks.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load faculty data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [facultyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refreshStudents = useCallback(async (filters?: { department?: string; riskLevel?: string }) => {
    try {
      const updated = await facultyService.getStudents(filters);
      setStudents(updated);
    } catch (err) {
      console.error('Failed to refresh student list:', err);
    }
  }, []);

  const submitIntervention = useCallback(
    (studentId: string, details: Record<string, unknown>) =>
      facultyService.submitIntervention(studentId, details),
    []
  );

  return {
    overview,
    students,
    atRiskStudents,
    deptAnalytics,
    weeklyActivity,
    attendanceTrend,
    todayClasses,
    pendingTasks,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchAll(true),
    submitIntervention,
    refreshStudents,
  };
}

// ─── Lightweight section-level hooks ─────────────────────────────────────────

export function useFacultyStudents(filters?: { department?: string; riskLevel?: string }) {
  const [data, setData] = useState<StudentSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await facultyService.getStudents(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.department, filters?.riskLevel]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}

export function useFacultyCodingStats(department?: string) {
  const [data, setData] = useState<StudentCodingStats[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await facultyService.getCodingStats(department));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coding stats');
    } finally {
      setIsLoading(false);
    }
  }, [department]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}
