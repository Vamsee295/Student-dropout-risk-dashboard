/**
 * useStudentAttendance.ts — Student Attendance Hook
 *
 * Fetches all student attendance data from the backend.
 * The student's identity is determined server-side from the JWT — NOT from the URL.
 * All metrics (overall %, classes attended, below 75%, warnings, calendar)
 * are dynamically calculated from the same MySQL AttendanceRecord table
 * that the Faculty portal writes to.
 *
 * This means there is exactly ONE source of truth.
 * If faculty changes P → A, the next call to useStudentAttendance will
 * reflect that change automatically.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  attendanceService,
  StudentAttendanceSummary,
  StudentCalendar,
  SubjectAttendance,
} from "@/services/attendanceService";

export function useStudentAttendance() {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getStudentSummary();
      setSummary(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export function useStudentCalendar(courseId: string | null) {
  const [calendar, setCalendar] = useState<StudentCalendar | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await attendanceService.getStudentCalendar(id);
      setCalendar(data);
    } catch {
      setCalendar(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) fetchCalendar(courseId);
  }, [courseId, fetchCalendar]);

  return { calendar, loading };
}
