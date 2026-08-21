"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Search, MessageSquare, Paperclip, Plus, X, Loader2 } from "lucide-react";
import { useConversations, useConversationDetail } from "@/hooks/useMessages";
import { messageService, ConversationListItem, FacultyContact } from "@/services/messageService";

function timeLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString();
}

// ── New Conversation Modal ────────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (conv: ConversationListItem) => void;
}) {
  const [faculty, setFaculty] = useState<FacultyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    messageService.getAvailableFaculty().then((f) => { setFaculty(f); setLoading(false); });
  }, []);

  const filtered = faculty.filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSelect(f: FacultyContact) {
    setCreating(true);
    try {
      const conv = await messageService.createConversationWithFaculty(f.id);
      onCreated(conv);
    } catch { /* fall through */ }
    setCreating(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">New Conversation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-4">
          <Search size={14} className="text-slate-400" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty…"
            className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelect(f)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {f.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{f.name}</p>
                  <p className="text-[10px] text-slate-400">{f.role}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8">No faculty found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { conversations, loading: convLoading, refetch, updateConversationActivity } = useConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
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

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  const filtered = conversations.filter((c) => {
    const name = c.faculty.name.toLowerCase();
    return name.includes(search.toLowerCase());
  });

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

  function handleCreated(conv: ConversationListItem) {
    setShowModal(false);
    refetch();
    setActiveId(conv.id);
  }

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-400 mt-0.5">Communicate with faculty and academic staff</p>
      </div>

      {showModal && (
        <NewConversationModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[600px]">
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100 space-y-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..." className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400" />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={13} /> New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-blue-400" />
              </div>
            )}
            {!convLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare size={32} className="text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No conversations yet</p>
                <p className="text-[10px] text-slate-300 mt-1">Click "New Conversation" to start</p>
              </div>
            )}
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeId === c.id ? "bg-blue-50" : ""}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {c.faculty.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.faculty.name}</p>
                    <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">{timeLabel(c.last_message_time)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.last_message ?? "No messages yet"}</p>
                </div>
                {c.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <MessageSquare size={40} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Select a conversation</p>
              <p className="text-xs text-slate-300 mt-1">or start a new one</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {activeConv?.faculty.avatar ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{activeConv?.faculty.name}</p>
                    <p className="text-[10px] text-slate-400">Faculty</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/30">
                {msgLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-blue-400" />
                  </div>
                )}
                {!msgLoading && detail && detail.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={40} className="text-slate-200 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">No messages yet</p>
                    <p className="text-xs text-slate-300 mt-1">Send a message to start the conversation</p>
                  </div>
                )}
                {detail?.messages.map((m) => {
                  const isMe = m.sender_role === "STUDENT";
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm"
                      }`}>
                        <p>{m.content}</p>
                        <p className={`text-[9px] mt-1 ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                          {timeLabel(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Send error */}
              {sendError && (
                <div className="px-4 py-1 bg-red-50 border-t border-red-100">
                  <p className="text-[10px] text-red-500">{sendError}</p>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition-colors">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    className="p-1.5 rounded-lg bg-blue-600 disabled:bg-slate-200 text-white hover:bg-blue-700 transition-colors">
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
