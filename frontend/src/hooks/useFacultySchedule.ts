"use client";

import { useState } from "react";
import { calendarService, CalendarEventCreate, CalendarEventUpdate } from "@/services/calendarService";

export function useFacultySchedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEvent = async (eventData: CalendarEventCreate) => {
    try {
      setLoading(true);
      setError(null);
      return await calendarService.createEvent(eventData);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to create event";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const editEvent = async (eventId: number, eventData: CalendarEventUpdate) => {
    try {
      setLoading(true);
      setError(null);
      return await calendarService.updateEvent(eventId, eventData);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to update event";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeEvent = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      await calendarService.deleteEvent(eventId);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to delete event";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { addEvent, editEvent, removeEvent, loading, error };
}
