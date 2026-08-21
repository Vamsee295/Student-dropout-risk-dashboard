/**
 * useMessages.ts
 * React hook that combines REST + WebSocket for real-time messaging.
 * Keeps a live message list and reconnects on disconnect.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  messageService,
  ConversationDetail,
  ConversationListItem,
  MessageResponse,
} from "@/services/messageService";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host.replace("3000", "8000")}`
    : "ws://localhost:8000");

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

  // Helper to instantly update the left-sidebar conversation list without reloading
  const updateConversationActivity = useCallback((convId: number, content: string, timestamp: string, incrementUnread: boolean) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === convId);
      if (idx === -1) return prev; // If not in list, we could append it, but refetch might be safer later
      const target = { ...prev[idx] };
      target.last_message = content;
      target.last_message_time = timestamp;
      if (incrementUnread) {
        target.unread_count += 1;
      }
      
      const newList = [...prev];
      newList[idx] = target;
      // Sort by timestamp descending
      return newList.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
    });
  }, []);

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
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch REST history
  const fetchHistory = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await messageService.getConversation(id);
      setDetail(data);
      // Mark as read after loading
      await messageService.markAsRead(id).catch(() => {});
    } catch {
      // silently fall through
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket setup
  const connectWS = useCallback((id: number) => {
    const token = getToken();
    if (!token) return;

    // Connect to the backend WS route
    const url = `${WS_BASE}/api/v1/ws/messages/${id}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);

    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data);
        if (event.type === "new_message" || event.type === "message.created") {
          const msg: MessageResponse = event.data || event.message;
          if (!msg || !msg.id) return;
          
          setDetail((prev) => {
            if (!prev) return prev;
            // Deduplicate by message.id
            if (prev.messages.some((m) => m.id === msg.id)) return prev;
            return {
              ...prev,
              messages: [...prev.messages, msg].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id - b.id
              ),
            };
          });
          
          onMessageActivity?.(msg);
          // Mark as read immediately
          messageService.markAsRead(id).catch(() => {});
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onclose = () => {
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWS(id);
        }
      }, 3000);
    };

    wsRef.current = ws;
  }, [onMessageActivity]);

  useEffect(() => {
    if (!conversationId) return;

    fetchHistory(conversationId);
    connectWS(conversationId);

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [conversationId, fetchHistory, connectWS]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      setSending(true);
      try {
        const sentMsg = await messageService.sendMessage(conversationId, content);
        // Immediately append the returned DB message to local state:
        setDetail((prev) => {
          if (!prev) return prev;
          // Deduplicate by message.id
          if (prev.messages.some((m) => m.id === sentMsg.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, sentMsg].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id - b.id
            ),
          };
        });
        
        onMessageActivity?.(sentMsg);
        return sentMsg;
      } catch (e: any) {
        throw new Error(e?.response?.data?.detail ?? "Failed to send");
      } finally {
        setSending(false);
      }
    },
    [conversationId, onMessageActivity]
  );

  return { detail, loading, sending, sendMessage };
}
