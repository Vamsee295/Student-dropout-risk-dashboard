/**
 * useMessages.ts
 * React hook that combines REST + WebSocket for real-time messaging.
 *
 * Key design decisions:
 * - wsRef holds the current live WebSocket.
 * - reconnectTimer ref prevents duplicate reconnect timers.
 * - destroyed ref ensures no state updates after unmount / conversation switch.
 * - Sender's own message is appended optimistically from the REST response.
 * - Receiver's message arrives via WS and is deduplicated by message.id.
 * - onMessageActivity callback is stored in a ref to avoid stale closures.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  messageService,
  ConversationDetail,
  ConversationListItem,
  MessageResponse,
} from "@/services/messageService";

// ── WebSocket URL helper ──────────────────────────────────────────────────────

function getWsBase(): string {
  if (typeof window === "undefined") return "ws://localhost:8000";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  // Replace Next.js dev port (3000) with backend port (8000)
  const host = window.location.host.replace(/:\d+$/, ":8000");
  return `${proto}//${host}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// ── useConversations ───────────────────────────────────────────────────────────

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  /** Instantly update sidebar without a full refetch when a message is sent/received. */
  const updateConversationActivity = useCallback(
    (convId: number, content: string, timestamp: string, incrementUnread: boolean) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx === -1) {
          // If we receive a message for an unknown conversation, refetch the list
          setTimeout(fetch, 100);
          return prev;
        }
        const updated = { ...prev[idx] };
        updated.last_message = content;
        updated.last_message_time = timestamp;
        if (incrementUnread) updated.unread_count += 1;
        const next = [...prev];
        next[idx] = updated;
        return next.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
      });
    },
    [fetch]
  );

  // Global WebSocket for sidebar updates
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let ws: WebSocket;
    let reconnectTimer: any;

    const connect = () => {
      ws = new WebSocket(`${getWsBase()}/api/v1/ws/messages/stream/me?token=${encodeURIComponent(token)}`);
      ws.onmessage = (evt) => {
        try {
          const event = JSON.parse(evt.data);
          if (event.type === "new_message" && event.data) {
            const msg = event.data;
            const convId = event.conversation_id;
            updateConversationActivity(convId, msg.content, msg.created_at, true);
          }
        } catch (e) {
          console.warn("[useConversations WS Parse Error]", e);
        }
      };
      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [updateConversationActivity]);

  return { conversations, loading, error, refetch: fetch, updateConversationActivity };
}

// ── useConversationDetail ─────────────────────────────────────────────────────

export function useConversationDetail(
  conversationId: number | null,
  onMessageActivity?: (msg: MessageResponse) => void
) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Stable refs to avoid stale closures
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyedRef = useRef(false);   // true after unmount or conversationId change
  const convIdRef = useRef<number | null>(null);
  // Store onMessageActivity in a ref so the WS onmessage handler always calls the latest version
  const onActivityRef = useRef(onMessageActivity);
  useEffect(() => { onActivityRef.current = onMessageActivity; }, [onMessageActivity]);

  // ── Append a message (deduplicates by id) ───────────────────────────────────
  const appendMessage = useCallback((msg: MessageResponse) => {
    if (destroyedRef.current) return;
    setDetail((prev) => {
      if (!prev) return prev;
      if (prev.messages.some((m) => m.id === msg.id)) return prev; // deduplicate
      const sorted = [...prev.messages, msg].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id - b.id
      );
      return { ...prev, messages: sorted };
    });
  }, []);

  // ── WebSocket connection ────────────────────────────────────────────────────
  const connectWS = useCallback((id: number) => {
    // Clean up any existing socket
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent reconnect loop from old socket
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const token = getToken();
    if (!token || destroyedRef.current) return;

    const url = `${getWsBase()}/api/v1/ws/messages/${id}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.debug(`[WS] Connected to conversation ${id}`);
    };

    ws.onmessage = (evt) => {
      if (destroyedRef.current || convIdRef.current !== id) return;
      try {
        const event = JSON.parse(evt.data);
        if (event.type === "new_message" || event.type === "message.created") {
          const msg: MessageResponse = event.data ?? event.message;
          if (!msg?.id) return;

          appendMessage(msg);
          onActivityRef.current?.(msg);

          // Mark as read silently
          messageService.markAsRead(id).catch(() => {});
        }
      } catch (err) {
        console.warn("[WS] Parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.debug("[WS] Error event (will attempt reconnect on close):", err);
    };

    ws.onclose = (evt) => {
      console.debug(`[WS] Closed (code=${evt.code}) for conversation ${id}`);
      if (destroyedRef.current || convIdRef.current !== id) return;
      // Reconnect after 3 s unless we were intentionally destroyed
      reconnectTimerRef.current = setTimeout(() => {
        if (!destroyedRef.current && convIdRef.current === id) {
          connectWS(id);
        }
      }, 3000);
    };
  }, [appendMessage]);

  // ── Fetch REST history ─────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (id: number) => {
    if (destroyedRef.current) return;
    setLoading(true);
    setDetail(null);
    try {
      const data = await messageService.getConversation(id);
      if (!destroyedRef.current && convIdRef.current === id) {
        setDetail(data);
        messageService.markAsRead(id).catch(() => {});
      }
    } catch {
      // silently ignore
    } finally {
      if (!destroyedRef.current) setLoading(false);
    }
  }, []);

  // ── Effect: switch conversation ────────────────────────────────────────────
  useEffect(() => {
    // Mark previous conversation as destroyed
    destroyedRef.current = false;
    convIdRef.current = conversationId;

    if (!conversationId) {
      // Clean up when deselected
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null; }
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
      setDetail(null);
      return;
    }

    fetchHistory(conversationId);
    connectWS(conversationId);

    return () => {
      // Mark this conversation as done so no stale state updates occur
      destroyedRef.current = true;
      convIdRef.current = null;
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null; }
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      setSending(true);
      try {
        const sentMsg = await messageService.sendMessage(conversationId, content);
        // Optimistically append sender's own message immediately
        appendMessage(sentMsg);
        onActivityRef.current?.(sentMsg);
        return sentMsg;
      } catch (e: any) {
        throw new Error(e?.response?.data?.detail ?? "Failed to send");
      } finally {
        setSending(false);
      }
    },
    [conversationId, appendMessage]
  );

  return { detail, loading, sending, sendMessage };
}
