/**
 * useNotifications.ts
 *
 * Provides:
 *  - notifs: list of Notification objects
 *  - unreadCount: integer badge value
 *  - markRead(id): marks a single notification read
 *  - markAllRead(): marks all read
 *  - refetch(): manual refresh
 *
 * Real-time: listens on the WS /notifications channel and on
 * /ws/student/{student_id} for push events from the backend.
 * Falls back to polling every 30 s if WS is unavailable.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

export interface NotifItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function getWsBase(): string {
  if (typeof window === "undefined") return "ws://localhost:8000";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host.replace(/:\d+$/, ":8000");
  return `${proto}//${host}`;
}

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        apiClient.get("/notifications/").catch(() => null),
        apiClient.get("/notifications/unread-count").catch(() => null),
      ]);
      if (!mountedRef.current) return;
      if (listRes) {
        const data: NotifItem[] = listRes.data?.data ?? listRes.data ?? [];
        setNotifs(Array.isArray(data) ? data : []);
      }
      if (countRes) {
        setUnreadCount(countRes.data?.unread_count ?? 0);
      }
    } catch {
      // silently ignore
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Prepend an incoming WS notification without re-fetching
  const handleWsMessage = useCallback((raw: string) => {
    try {
      const event = JSON.parse(raw);
      // Notification events may come as { type: "notification", data: {...} }
      // or as the notification object directly
      const payload: NotifItem | null =
        event.type === "notification" ? event.data :
        event.id && event.title ? event :
        null;
      if (!payload || !mountedRef.current) return;
      setNotifs((prev) => [payload, ...prev.filter((n) => n.id !== payload.id)]);
      setUnreadCount((c) => c + 1);
    } catch {
      // ignore parse errors
    }
  }, []);

  // Connect to WS notification channel
  useEffect(() => {
    if (!user) return;
    mountedRef.current = true;

    // Connect to general /ws/notifications channel
    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      const ws = new WebSocket(`${getWsBase()}/api/v1/ws/notifications`);
      wsRef.current = ws;
      ws.onmessage = (e) => handleWsMessage(e.data);
      ws.onclose = () => {
        // Reconnect after 5 s
        if (mountedRef.current) {
          setTimeout(() => connect(), 5000);
        }
      };
    };
    connect();

    // Initial fetch + polling every 30 s as fallback
    fetchAll();
    pollRef.current = setInterval(fetchAll, 30_000);

    return () => {
      mountedRef.current = false;
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.id, fetchAll, handleWsMessage]);

  const markRead = useCallback(async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiClient.put("/notifications/mark-all-read");
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  return { notifs, unreadCount, loading, refetch: fetchAll, markRead, markAllRead };
}
