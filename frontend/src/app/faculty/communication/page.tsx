"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Search, Bell, Plus, Loader2, X, ChevronRight
} from "lucide-react";
import { useConversations, useConversationDetail } from "@/hooks/useMessages";
import { messageService, ConversationListItem } from "@/services/messageService";

const templates = [
  {
    title: "Attendance Warning",
    content: "Dear Student, your current attendance is below the required 75%. Please attend classes regularly to avoid academic consequences.",
    type: "warning",
  },
  {
    title: "Assignment Reminder",
    content: "Dear Student, this is a reminder that your assignment is due soon. Please submit on time to avoid penalties.",
    type: "info",
  },
  {
    title: "Risk Alert",
    content: "Dear Student, we are concerned about your academic performance and risk level. Please visit the faculty office at the earliest.",
    type: "critical",
  },
  {
    title: "Meeting Invitation",
    content: "Dear Student, you are invited to a mentoring session. Your attendance is important for your academic progress.",
    type: "info",
  },
];

function timeLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString();
}

export default function CommunicationPage() {
  const { conversations, loading: convLoading, refetch, updateConversationActivity } = useConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { detail, loading: msgLoading, sending, sendMessage } = useConversationDetail(activeId, (msg) => {
    if (activeId) {
      updateConversationActivity(activeId, msg.content, msg.created_at, false);
    }
  });

  // Select first conversation automatically
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  const filtered = conversations.filter((c) =>
    c.student.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSend() {
    if (!input.trim() || !activeId) return;
    setSendError(null);
    const text = input.trim();
    setInput("");
    try {
      await sendMessage(text);
    } catch (e: any) {
      setSendError(e.message);
    }
  }

  function applyTemplate(content: string) {
    setInput(content);
  }

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication</h1>
          <p className="text-sm text-slate-500 mt-1">Chat with students in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation list + Chat */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 580 }}>
          {/* Tabs / Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <MessageSquare size={16} className="text-emerald-500" /> Student Messages
            </h3>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Search size={12} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400 w-36"
              />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Conversation list */}
            <div className="w-56 border-r border-slate-100 overflow-y-auto flex-shrink-0">
              {convLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-emerald-400" />
                </div>
              )}
              {!convLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                  <MessageSquare size={28} className="text-slate-200 mb-2" />
                  <p className="text-[10px] text-slate-400">No student messages yet</p>
                </div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeId === c.id ? "bg-emerald-50" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {c.student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{c.student.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.last_message ?? "No messages"}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Chat panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!activeId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <MessageSquare size={36} className="text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">Select a conversation</p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {activeConv?.student.avatar ?? "?"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{activeConv?.student.name}</p>
                      <p className="text-[10px] text-slate-400">Student</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/30">
                    {msgLoading && (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 size={18} className="animate-spin text-emerald-400" />
                      </div>
                    )}
                    {!msgLoading && detail && detail.messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare size={32} className="text-slate-200 mb-2" />
                        <p className="text-xs text-slate-400">No messages yet</p>
                      </div>
                    )}
                    {detail?.messages.map((m) => {
                      const isMe = m.sender_role === "FACULTY" || m.sender_role === "DEAN" || m.sender_role === "ADMIN";
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-emerald-600 text-white rounded-br-sm"
                              : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm"
                          }`}>
                            <p>{m.content}</p>
                            <p className={`text-[9px] mt-0.5 ${isMe ? "text-emerald-200" : "text-slate-400"}`}>
                              {timeLabel(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Error */}
                  {sendError && (
                    <div className="px-4 py-1 bg-red-50 border-t border-red-100">
                      <p className="text-[10px] text-red-500">{sendError}</p>
                    </div>
                  )}

                  {/* Input */}
                  <div className="px-3 py-2.5 border-t border-slate-100 bg-white flex-shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 transition-colors">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message…"
                        className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                      />
                      <button onClick={handleSend} disabled={!input.trim() || sending}
                        className="p-1.5 rounded-lg bg-emerald-600 disabled:bg-slate-200 text-white hover:bg-emerald-700 transition-colors">
                        {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Templates */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <Bell size={15} className="text-amber-500" /> Quick Templates
          </h3>
          <p className="text-[10px] text-slate-400 mb-3">Click to pre-fill the message input</p>
          <div className="space-y-3">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(tpl.content)}
                className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${
                  tpl.type === "critical"
                    ? "bg-red-50 border-red-100 hover:border-red-200"
                    : tpl.type === "warning"
                    ? "bg-amber-50 border-amber-100 hover:border-amber-200"
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <p className={`text-xs font-bold mb-1 ${
                  tpl.type === "critical" ? "text-red-700" :
                  tpl.type === "warning" ? "text-amber-700" : "text-slate-700"
                }`}>{tpl.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{tpl.content}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
