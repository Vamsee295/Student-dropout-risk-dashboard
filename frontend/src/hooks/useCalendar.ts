"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { calendarService, CalendarEvent } from "@/services/calendarService";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host.replace("3000", "8000")}`
    : "ws://localhost:8000");

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await calendarService.getEvents();
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // WebSocket setup for real-time updates
  const connectWS = useCallback(() => {
    if (typeof window === "undefined") return;
    
    // Using a generic /calendar channel for all calendar updates
    const url = `${WS_BASE}/api/v1/ws/calendar`;
    const ws = new WebSocket(url);

    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data);
        if (event.type === "calendar_update") {
          // When calendar is updated, we refetch events. 
          // (Alternatively, backend could send the specific CRUD operation & payload)
          fetchEvents();
        }
      } catch (err) {
        console.error("Calendar WS parse error:", err);
      }
    };

    ws.onclose = () => {
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWS();
        }
      }, 3000);
    };

    wsRef.current = ws;
  }, [fetchEvents]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWS]);

  return { events, loading, error, refetch: fetchEvents };
}
