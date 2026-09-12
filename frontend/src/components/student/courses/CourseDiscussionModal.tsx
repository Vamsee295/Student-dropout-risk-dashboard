import React, { useEffect, useState } from "react";
import { X, MessageSquare, Loader2, Send, Pin, Lock, User as UserIcon } from "lucide-react";
import apiClient from "@/api/axios";

interface Reply {
  id: number;
  content: string;
  is_faculty_answer: boolean;
  created_at: string;
  author_name: string;
  author_role: string;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  author_name: string;
  author_role: string;
  reply_count: number;
}

interface Props {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export default function CourseDiscussionModal({ courseId, courseName, onClose }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [courseId]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/lms/courses/${courseId}/discussions`);
      setThreads(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load discussions");
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (threadId: number) => {
    try {
      setLoadingReplies(true);
      const { data } = await apiClient.get(`/lms/discussions/${threadId}/replies`);
      setReplies(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleThreadClick = (threadId: number) => {
    setActiveThreadId(threadId);
    loadReplies(threadId);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    
    try {
      setSubmitting(true);
      await apiClient.post(`/lms/courses/${courseId}/discussions`, {
        title: newThreadTitle,
        content: newThreadContent
      });
      setIsCreatingThread(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      loadThreads();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !activeThreadId) return;
    
    try {
      setSubmitting(true);
      await apiClient.post(`/lms/discussions/${activeThreadId}/replies`, {
        content: newReplyContent
      });
      setNewReplyContent("");
      loadReplies(activeThreadId);
      // Update thread reply count locally
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, reply_count: t.reply_count + 1 } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              Course Discussion
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{courseId} — {courseName}</p>
          </div>
          <div className="flex items-center gap-4">
            {!activeThreadId && !isCreatingThread && (
              <button 
                onClick={() => setIsCreatingThread(true)}
                className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Discussion
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar - Thread List */}
          <div className={`w-full md:w-1/3 border-r border-slate-100 bg-slate-50/30 overflow-y-auto ${activeThreadId || isCreatingThread ? 'hidden md:block' : 'block'}`}>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : error ? (
              <div className="p-4 text-xs text-red-600">{error}</div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No discussions yet. Start one!</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {threads.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveThreadId(t.id); setIsCreatingThread(false); }}
                    className={`w-full text-left p-4 hover:bg-white transition-colors ${activeThreadId === t.id ? 'bg-white border-l-2 border-l-blue-500 shadow-sm' : ''}`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {t.is_pinned && <Pin size={12} className="text-amber-500 mt-1 flex-shrink-0" />}
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{t.title}</h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserIcon size={10} /> {t.author_name}
                      </span>
                      <span>{t.reply_count} replies</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane - Detail View */}
          <div className={`flex-1 bg-white flex flex-col ${!activeThreadId && !isCreatingThread ? 'hidden md:flex' : 'flex'}`}>
            
            {!activeThreadId && !isCreatingThread ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <MessageSquare size={48} className="text-slate-200 mb-4" />
                <p>Select a discussion to view</p>
              </div>
            ) : isCreatingThread ? (
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setIsCreatingThread(false)} className="md:hidden text-slate-400 hover:text-slate-900"><X size={20}/></button>
                  <h3 className="text-lg font-bold text-slate-900">Start a new discussion</h3>
                </div>
                <form onSubmit={handleCreateThread} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                    <input 
                      required
                      placeholder="What do you want to discuss?"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      value={newThreadTitle}
                      onChange={e => setNewThreadTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                    <textarea 
                      required
                      placeholder="Add details here..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm h-48 resize-none"
                      value={newThreadContent}
                      onChange={e => setNewThreadContent(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={submitting}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                    Post Discussion
                  </button>
                </form>
              </div>
            ) : activeThread ? (
              <>
                <div className="p-6 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setActiveThreadId(null)} className="md:hidden text-slate-400 hover:text-slate-900"><X size={20}/></button>
                    {activeThread.is_pinned && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Pin size={10}/> Pinned</span>}
                    {activeThread.is_locked && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> Locked</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{activeThread.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="font-semibold text-slate-700">{activeThread.author_name}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase text-[9px] font-bold">{activeThread.author_role}</span>
                    <span>•</span>
                    <span>{new Date(activeThread.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{activeThread.content}</div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                  {loadingReplies ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                  ) : replies.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-10">No replies yet.</div>
                  ) : (
                    replies.map(r => (
                      <div key={r.id} className={`p-4 rounded-2xl ${r.is_faculty_answer ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-900">{r.author_name}</span>
                            {r.is_faculty_answer && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">FACULTY</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap">{r.content}</div>
                      </div>
                    ))
                  )}
                </div>
                
                {!activeThread.is_locked && (
                  <form onSubmit={handleCreateReply} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                      type="text"
                      required
                      placeholder="Write a reply..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                      value={newReplyContent}
                      onChange={e => setNewReplyContent(e.target.value)}
                    />
                    <button 
                      disabled={submitting}
                      className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                )}
              </>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}
