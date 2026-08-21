/**
 * useAttendance.ts — Faculty Attendance Hook
 *
 * Manages:
 *  - Course selection
 *  - Faculty attendance grid (Mon-Fri per enrolled student)
 *  - Faculty stats (present today, absent today, below 75%, overall avg)
 *  - Toggle P ↔ A with immediate MySQL persistence
 *
 * LATE has been completely removed. Only P and A exist.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { attendanceService, GridRow, FacultyStats, CourseItem, BelowThresholdResponse } from "@/services/attendanceService";
import apiClient from "@/api/axios";

export function useAttendance() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [grid, setGrid] = useState<GridRow[]>([]);
  const [stats, setStats] = useState<FacultyStats>({
    present_today: 0,
    absent_today: 0,
    total_today: 0,
    below_75_count: 0,
    overall_avg: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const [belowThresholdData, setBelowThresholdData] = useState<BelowThresholdResponse>({
    threshold: 75,
    count: 0,
    students: []
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [attendanceGrid, setAttendanceGrid] = useState<any[]>([]);

  // ── Load courses on mount ────────────────────────────────────────────────────
  useEffect(() => {
    attendanceService.getCourses().then((c) => {
      setCourses(c);
      if (c.length > 0) setSelectedCourseId(c[0].id);
    });

    // Also fetch legacy weekly data and the new below-threshold data
    Promise.all([
      apiClient.get("/attendance/weekly"),
      attendanceService.getBelowThresholdStudents(),
    ])
      .then(([weekly, below]) => {
        setWeeklyData(weekly.data);
        setBelowThresholdData(below);
      })
      .catch(console.error);
  }, []);

  // ── Fetch grid + stats when course changes ───────────────────────────────────
  const fetchCourseData = useCallback(async () => {
    if (!selectedCourseId) return;
    setIsLoading(true);
    try {
      const [gridData, statsData] = await Promise.all([
        attendanceService.getFacultyGrid(selectedCourseId, weekOffset),
        attendanceService.getFacultyStats(selectedCourseId),
      ]);
      setGrid(gridData);
      setStats(statsData);
      // Convert to legacy attendanceGrid format for compatibility
      setAttendanceGrid(
        gridData.map((row) => ({
          id: row.student_id,
          name: row.student_name,
          roll: row.roll,
          ...Object.fromEntries(row.cells.map((c) => [c.day_label.toLowerCase(), c.status])),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId, weekOffset]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // ── Toggle P ↔ A ─────────────────────────────────────────────────────────────
  const toggleCell = useCallback(
    async (studentId: string, date: string) => {
      if (!selectedCourseId || isToggling) return;
      setIsToggling(true);

      // Optimistic update
      setGrid((prev) =>
        prev.map((row) => {
          if (row.student_id !== studentId) return row;
          return {
            ...row,
            cells: row.cells.map((cell) => {
              if (cell.date !== date) return cell;
              const next = cell.status === "P" ? "A" : "P";
              return { ...cell, status: next };
            }),
          };
        })
      );

      try {
        const result = await attendanceService.toggleAttendance(studentId, selectedCourseId, date);
        // Reconcile with server result
        setGrid((prev) =>
          prev.map((row) => {
            if (row.student_id !== studentId) return row;
            return {
              ...row,
              cells: row.cells.map((cell) => {
                if (cell.date !== date) return cell;
                return { ...cell, status: result.status };
              }),
            };
          })
        );
        // Refresh stats and below threshold data
        const [updatedStats, updatedBelowData] = await Promise.all([
          attendanceService.getFacultyStats(selectedCourseId),
          attendanceService.getBelowThresholdStudents()
        ]);
        setStats(updatedStats);
        setBelowThresholdData(updatedBelowData);
      } catch (err) {
        console.error("Toggle failed:", err);
        // Revert optimistic update
        fetchCourseData();
      } finally {
        setIsToggling(false);
      }
    },
    [selectedCourseId, isToggling, fetchCourseData]
  );

  return {
    // New API
    courses,
    selectedCourseId,
    setSelectedCourseId,
    weekOffset,
    setWeekOffset,
    grid,
    stats,
    isToggling,
    toggleCell,
    refetch: fetchCourseData,

    // New structured below threshold data
    belowThresholdData,

    // Legacy API (backward compat)
    weeklyData,
    attendanceGrid,
    isLoading,
  };
}
