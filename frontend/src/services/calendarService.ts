import apiClient from "@/api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  event_type: "class" | "exam" | "assignment" | "meeting" | "holiday" | "career_event" | "other";
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null; // HH:MM:SS
  course_id: string | null;
  faculty_id: number;
  created_at: string;
}

export interface CalendarEventCreate {
  title: string;
  description?: string;
  event_type: "class" | "exam" | "assignment" | "meeting" | "holiday" | "career_event" | "other";
  date: string;
  start_time?: string;
  end_time?: string;
  course_id?: string;
}

export interface CalendarEventUpdate {
  title?: string;
  description?: string;
  event_type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  course_id?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const calendarService = {
  /** Fetch all events applicable to the authenticated user. */
  async getEvents(): Promise<CalendarEvent[]> {
    const { data } = await apiClient.get("/calendar");
    return data;
  },

  /** Create a new event (Faculty only). */
  async createEvent(eventData: CalendarEventCreate): Promise<CalendarEvent> {
    const { data } = await apiClient.post("/calendar", eventData);
    return data;
  },

  /** Update an existing event (Faculty only). */
  async updateEvent(eventId: number, eventData: CalendarEventUpdate): Promise<CalendarEvent> {
    const { data } = await apiClient.put(`/calendar/${eventId}`, eventData);
    return data;
  },

  /** Delete an event (Faculty only). */
  async deleteEvent(eventId: number): Promise<void> {
    await apiClient.delete(`/calendar/${eventId}`);
  }
};
