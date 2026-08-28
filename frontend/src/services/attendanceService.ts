/**
 * attendanceService.ts
 * Axios wrappers for the Attendance API.
 * AttendanceStatus is ONLY "PRESENT" | "ABSENT" — LATE has been completely removed.
 */
import apiClient from "@/api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

/** The only two valid attendance statuses */
export type AttendanceStatus = "PRESENT" | "ABSENT";

/** Single cell in the faculty grid */
export interface GridCell {
  date: string;        // ISO date "2026-08-19"
  day_label: string;   // "Mon", "Tue"...
  status: string;      // "P", "A", or ""
}

/** One student row in the faculty attendance grid */
export interface GridRow {
  student_id: string;
  student_name: string;
  roll: string;
  cells: GridCell[];
}

/** Faculty stats card values */
export interface FacultyStats {
  present_today: number;
  absent_today: number;
  total_today: number;
  below_75_count: number;
  overall_avg: number;
}

/** A course available for attendance */
export interface CourseItem {
  id: string;
  name: string;
  display: string;     // "CS101 – Introduction to Programming"
}

export interface BelowThresholdStudent {
  student_id: string;
  name: string;
  roll_number: string;
  course: string;
  course_id: string;
  attendance_percentage: number;
  severity: "Critical" | "High Risk" | "At Risk";
}

export interface BelowThresholdResponse {
  threshold: number;
  count: number;
  students: BelowThresholdStudent[];
}

/** Student subject attendance row */
export interface SubjectAttendance {
  course_id: string;
  course_name: string;
  faculty_name: string;
  present: number;
  total: number;
  percentage: number;
  is_below_75: boolean;
  is_borderline: boolean;
}

/** Attendance warning for a subject below 75% */
export interface AttendanceWarning {
  course_id: string;
  course_name: string;
  present: number;
  total: number;
  percentage: number;
  consecutive_needed: number;
}

/** Full student attendance summary */
export interface StudentAttendanceSummary {
  overall_percentage: number;
  total_present: number;
  total_classes: number;
  below_75_count: number;
  borderline_count: number;
  subjects: SubjectAttendance[];
  warnings: AttendanceWarning[];
  monthly_trend: { month: string; pct: number }[];
}

/** Single calendar cell */
export interface CalendarCell {
  date: string;
  day_label: string;
  status: string;      // "P" or "A"
}

/** Week row in calendar */
export interface CalendarWeek {
  week_label: string;  // "W1", "W2"...
  cells: CalendarCell[];
}

export interface StudentCalendar {
  course_id: string;
  course_name: string;
  weeks: CalendarWeek[];
}

// ── Session Models ────────────────────────────────────────────────────────────

export interface AttendanceSessionSummary {
  id: number;
  course_id: string;
  course_name: string;
  section: string;
  session_type: string;
  session_label: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  faculty_name: string | null;
  total_students: number;
  present_count: number;
  absent_count: number;
}

export interface SessionRosterStudent {
  student_id: string;
  name: string;
  roll: string;
  section: string;
  is_absent: boolean;
}

export interface SessionRosterResponse {
  session_id: number;
  course_id: string;
  course_name: string;
  section: string;
  session_type: string;
  session_label: string;
  session_date: string;
  status: string;
  students: SessionRosterStudent[];
  total_students: number;
  present_count: number;
  absent_count: number;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const attendanceService = {
  // ── Faculty ─────────────────────────────────────────────────────────────────

  async getCourses(): Promise<CourseItem[]> {
    const { data } = await apiClient.get("/attendance/faculty/courses");
    return data;
  },

  async getFacultyStats(courseId: string): Promise<FacultyStats> {
    const { data } = await apiClient.get("/attendance/faculty/stats", {
      params: { course_id: courseId },
    });
    return data;
  },

  async getFacultyGrid(courseId: string, weekOffset = 0): Promise<GridRow[]> {
    const { data } = await apiClient.get("/attendance/faculty/grid", {
      params: { course_id: courseId, week_offset: weekOffset },
    });
    return data;
  },

  async getBelowThresholdStudents(courseId?: string, threshold?: number): Promise<BelowThresholdResponse> {
    const { data } = await apiClient.get("/attendance/faculty/below-threshold", {
      params: { course_id: courseId, threshold },
    });
    return data;
  },

  /**
   * Toggle P ↔ A for a student on a specific date.
   * The backend handles the P→A→P logic.
   */
  async toggleAttendance(
    studentId: string,
    courseId: string,
    date: string       // ISO date "YYYY-MM-DD"
  ): Promise<{ student_id: string; course_id: string; date: string; status: string }> {
    const { data } = await apiClient.post("/attendance/toggle", null, {
      params: { student_id: studentId, course_id: courseId, date },
    });
    return data;
  },

  /**
   * Set attendance to an explicit status (used when importing CSV, etc.)
   * Status MUST be "PRESENT" or "ABSENT" — "LATE" is rejected by the backend.
   */
  async setAttendance(
    studentId: string,
    courseId: string,
    date: string,
    status: AttendanceStatus
  ): Promise<void> {
    await apiClient.put("/attendance/record", {
      student_id: studentId,
      course_id: courseId,
      date,
      status,
    });
  },

  // ── Session-Based Workflow ──────────────────────────────────────────────────

  async getSessions(courseId?: string, section?: string): Promise<AttendanceSessionSummary[]> {
    const { data } = await apiClient.get("/attendance/faculty/sessions", {
      params: { course_id: courseId, section },
    });
    return data;
  },

  async getSessionRoster(sessionId: number): Promise<SessionRosterResponse> {
    const { data } = await apiClient.get(`/attendance/faculty/sessions/${sessionId}/roster`);
    return data;
  },

  async postSessionAttendance(sessionId: number, absentStudentIds: string[]): Promise<any> {
    const { data } = await apiClient.post(`/attendance/faculty/sessions/${sessionId}/post`, {
      absent_student_ids: absentStudentIds,
    });
    return data;
  },

  // ── Student ─────────────────────────────────────────────────────────────────

  /**
   * Get the authenticated student's complete attendance summary.
   * Identity comes from the JWT — cannot be overridden.
   */
  async getStudentSummary(): Promise<StudentAttendanceSummary> {
    const { data } = await apiClient.get("/attendance/student");
    return data;
  },

  /**
   * Get student's attendance calendar for a specific course.
   * Groups real attendance records into Mon-Fri weeks.
   */
  async getStudentCalendar(courseId: string): Promise<StudentCalendar> {
    const { data } = await apiClient.get("/attendance/student/calendar", {
      params: { course_id: courseId },
    });
    return data;
  },
};
