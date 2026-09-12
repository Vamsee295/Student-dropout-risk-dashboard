import React, { useEffect, useState } from "react";
import { X, PlayCircle, Clock, Loader2, CheckCircle2 } from "lucide-react";
import apiClient from "@/api/axios";

interface Recording {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  recording_date: string;
  progress_percent: number;
  completed: boolean;
}

interface Props {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export default function RecordedClassesModal({ courseId, courseName, onClose }: Props) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/lms/courses/${courseId}/recordings`);
        setRecordings(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? "Failed to load recordings");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const markAsWatched = async (id: number) => {
    try {
      await apiClient.post(`/lms/recordings/${id}/progress`, {
        progress_percent: 100.0,
        completed: true
      });
      // Update local state
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, completed: true, progress_percent: 100 } : r));
    } catch (e) {
      console.error("Failed to mark as watched", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle size={20} className="text-purple-500" />
              Recorded Classes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{courseId} — {courseName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4 text-purple-500" />
              <p className="text-sm font-medium">Loading recorded classes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-20">
              <PlayCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No recorded classes yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check back later for new lectures.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recordings.map((r) => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-sm transition-all group flex flex-col">
                  {/* Thumbnail Placeholder */}
                  <div className="h-32 bg-slate-100 relative group-hover:bg-slate-200 transition-colors flex items-center justify-center">
                    <PlayCircle size={40} className="text-slate-300 group-hover:text-purple-500 transition-colors z-10" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                      <Clock size={10} /> {r.duration_minutes}m
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2" title={r.title}>{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3 line-clamp-2 flex-1">{r.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-400">
                        {new Date(r.recording_date).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {r.completed ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 size={12} /> Watched
                          </span>
                        ) : (
                          <button 
                            onClick={() => markAsWatched(r.id)}
                            className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
                          >
                            Mark Watched
                          </button>
                        )}
                        <a 
                          href={r.video_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <PlayCircle size={14} /> Watch
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
