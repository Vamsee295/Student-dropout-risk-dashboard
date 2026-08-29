/**
 * useAttendance.ts — Faculty Attendance Hook
 *
 * Manages:
 *  - Course & Section selection
 *  - Fetching Attendance Sessions
 *  - Fetching Student Roster for a specific session
 *  - Posting attendance
 *  - Faculty stats
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  attendanceService,
  CourseItem,
  AttendanceSessionSummary,
  SessionRosterResponse,
  FacultyStats,
  BelowThresholdResponse,
} from "@/services/attendanceService";
import apiClient from "@/api/axios";

export function useAttendance() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Sessions list
  const [sessions, setSessions] = useState<AttendanceSessionSummary[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);

  // Active session roster
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [roster, setRoster] = useState<SessionRosterResponse | null>(null);
  const [isRosterLoading, setIsRosterLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<FacultyStats>({
    present_today: 0,
    absent_today: 0,
    total_today: 0,
    below_75_count: 0,
    overall_avg: 0,
  });
  const [belowThresholdData, setBelowThresholdData] = useState<BelowThresholdResponse>({
    threshold: 75,
    count: 0,
    students: [],
  });
  
  // Legacy fields (for compatibility until full rewrite of page if needed)
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  // ── 1. Load Initial Data ──────────────────────────────────────────────────
  useEffect(() => {
    attendanceService.getCourses().then((c) => {
      setCourses(c);
      if (c.length > 0) setSelectedCourseId(c[0].id);
    });

    apiClient.get("/attendance/weekly")
      .then((res) => setWeeklyData(res.data))
      .catch(console.error);

    attendanceService.getBelowThresholdStudents()
      .then(setBelowThresholdData)
      .catch(console.error);
  }, []);

  // ── 2. Fetch Sessions when Course/Section changes ─────────────────────────
  const fetchSessions = useCallback(async () => {
    if (!selectedCourseId) return;
    setIsSessionsLoading(true);
    try {
      const data = await attendanceService.getSessions(
        selectedCourseId,
        selectedSection || undefined
      );
      setSessions(data);

      // Also refresh stats
      const newStats = await attendanceService.getFacultyStats(selectedCourseId);
      setStats(newStats);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setIsSessionsLoading(false);
    }
  }, [selectedCourseId, selectedSection]);

  useEffect(() => {
    fetchSessions();
    // Clear active session when course changes
    setActiveSessionId(null);
    setRoster(null);
  }, [fetchSessions]);

  // ── 3. Fetch Roster when Active Session changes ───────────────────────────
  const fetchRoster = useCallback(async (sessionId: number) => {
    setIsRosterLoading(true);
    try {
      const data = await attendanceService.getSessionRoster(sessionId);
      setRoster(data);
      setActiveSessionId(sessionId);
    } catch (err) {
      console.error("Failed to fetch roster", err);
    } finally {
      setIsRosterLoading(false);
    }
  }, []);

  // ── 4. Toggle Student Absent/Present locally ──────────────────────────────
  const toggleStudentRoster = useCallback((studentId: string) => {
    setRoster((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.student_id === studentId ? { ...s, is_absent: !s.is_absent } : s
        ),
      };
    });
  }, []);

  // ── 5. Post Attendance ────────────────────────────────────────────────────
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  const postAttendance = useCallback(async () => {
    if (!roster || !activeSessionId) return;
    setIsPosting(true);
    setPostSuccess(null);
    setPostError(null);
    try {
      const absentIds = roster.students.filter((s) => s.is_absent).map((s) => s.student_id);
      const result = await attendanceService.postSessionAttendance(activeSessionId, absentIds);
      
      // Refresh everything after confirmed backend success
      await fetchSessions();
      await fetchRoster(activeSessionId);
      const newBelow = await attendanceService.getBelowThresholdStudents();
      setBelowThresholdData(newBelow);

      const present = result?.present_count ?? roster.students.filter((s) => !s.is_absent).length;
      const absent  = result?.absent_count  ?? roster.students.filter((s) => s.is_absent).length;
      setPostSuccess(`Attendance posted — ${present} present, ${absent} absent.`);
      // Auto-clear after 4 s
      setTimeout(() => setPostSuccess(null), 4000);
    } catch (err: any) {
      console.error("Failed to post attendance", err);
      const msg = err?.response?.data?.detail ?? "Failed to post attendance. Please try again.";
      setPostError(msg);
      setTimeout(() => setPostError(null), 5000);
    } finally {
      setIsPosting(false);
    }
  }, [roster, activeSessionId, fetchSessions, fetchRoster]);

  return {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedSection,
    setSelectedSection,
    
    sessions,
    isSessionsLoading,
    fetchSessions,

    activeSessionId,
    roster,
    isRosterLoading,
    fetchRoster,
    toggleStudentRoster,

    postAttendance,
    isPosting,
    postSuccess,
    postError,

    stats,
    belowThresholdData,
    weeklyData, // legacy
  };
}
