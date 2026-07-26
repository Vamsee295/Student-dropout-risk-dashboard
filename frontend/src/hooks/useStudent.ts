/**
 * useStudent — Custom hook for Student Dashboard data
 *
 * Provides a clean { data, isLoading, error, refetch } interface.
 * All data flows through studentService — never call apiClient directly.
 *
 * Usage:
 *   const { overview, isLoading, error, refetch } = useStudent();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  studentService,
  type StudentOverview,
  type AssignmentProgress,
  type RiskDetails,
  type SemesterPerformance,
  type AttendanceRecord,
  type AttendanceTrend,
  type MarksTrend,
} from '@/services/studentService';

// ─── Hook State Type ──────────────────────────────────────────────────────────

interface UseStudentState {
  overview: StudentOverview | null;
  assignments: AssignmentProgress | null;
  risk: RiskDetails | null;
  performance: SemesterPerformance[] | null;
  attendance: AttendanceRecord[] | null;
  attendanceTrend: AttendanceTrend[] | null;
  marksTrend: MarksTrend[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudent(): UseStudentState {
  const { user } = useAuthStore();
  const studentId = user?.student_id ?? 'STU1000';

  const [overview, setOverview] = useState<StudentOverview | null>(null);
  const [assignments, setAssignments] = useState<AssignmentProgress | null>(null);
  const [risk, setRisk] = useState<RiskDetails | null>(null);
  const [performance, setPerformance] = useState<SemesterPerformance[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[] | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[] | null>(null);
  const [marksTrend, setMarksTrend] = useState<MarksTrend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch overview + assignments + risk in parallel (most critical)
      const results1 = await Promise.allSettled([
        studentService.getOverview(studentId),
        studentService.getAssignments(studentId),
        studentService.getRisk(studentId),
        studentService.getAttendanceTrend(studentId),
        studentService.getMarksTrend(studentId),
      ]);
      const [ov, asgn, rsk, attrend, mtrend] = results1;

      if (ov.status === 'fulfilled') setOverview(ov.value);
      else throw new Error(ov.reason?.message || 'Failed to load student overview');
      if (asgn.status === 'fulfilled') setAssignments(asgn.value);
      if (rsk.status === 'fulfilled') setRisk(rsk.value);
      if (attrend.status === 'fulfilled') setAttendanceTrend(attrend.value);
      if (mtrend.status === 'fulfilled') setMarksTrend(mtrend.value);

      // Fetch secondary data (non-blocking UI)
      const results2 = await Promise.allSettled([
        studentService.getPerformance(studentId),
        studentService.getAttendance(studentId),
      ]);
      const [perf, att] = results2;
      if (perf.status === 'fulfilled') setPerformance(perf.value);
      if (att.status === 'fulfilled') setAttendance(att.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    overview,
    assignments,
    risk,
    performance,
    attendance,
    attendanceTrend,
    marksTrend,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchAll(true),
  };
}

// ─── Lightweight section-level hooks ─────────────────────────────────────────
// Use these inside individual sub-pages that only need one data slice.

export function useStudentOverview() {
  const { user } = useAuthStore();
  const studentId = user?.id ? String(user.id) : 'current';
  const [data, setData] = useState<StudentOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await studentService.getOverview(studentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}

export function useStudentAssignments() {
  const { user } = useAuthStore();
  const studentId = user?.id ? String(user.id) : 'current';
  const [data, setData] = useState<AssignmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await studentService.getAssignments(studentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}

export function useStudentRisk() {
  const { user } = useAuthStore();
  const studentId = user?.id ? String(user.id) : 'current';
  const [data, setData] = useState<RiskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await studentService.getRisk(studentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load risk data');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}

export function useStudentAttendance() {
  const { user } = useAuthStore();
  const studentId = user?.id ? String(user.id) : 'current';
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [trend, setTrend] = useState<AttendanceTrend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rec, tr] = await Promise.all([
        studentService.getAttendance(studentId),
        studentService.getAttendanceTrend(studentId),
      ]);
      setRecords(rec);
      setTrend(tr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { records, trend, isLoading, error, refetch: fetch };
}

export function useStudentPerformance() {
  const { user } = useAuthStore();
  const studentId = user?.id ? String(user.id) : 'current';
  const [data, setData] = useState<SemesterPerformance[] | null>(null);
  const [marksTrend, setMarksTrend] = useState<MarksTrend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [perf, mt] = await Promise.all([
        studentService.getPerformance(studentId),
        studentService.getMarksTrend(studentId),
      ]);
      setData(perf);
      setMarksTrend(mt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, marksTrend, isLoading, error, refetch: fetch };
}
