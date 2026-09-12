import React, { useState } from "react";
import { X, Upload, Video, Loader2 } from "lucide-react";
import apiClient from "@/api/axios";

interface Props {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRecordingModal({ courseId, courseName, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: 60,
    recording_date: new Date().toISOString().split("T")[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiClient.post(`/lms/courses/${courseId}/recordings`, {
        ...formData,
        recording_date: new Date(formData.recording_date).toISOString()
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to add recording");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Video size={20} className="text-purple-500" />
              Upload Recording
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Week 1 - Lecture 1"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video URL *</label>
              <input
                type="url"
                required
                placeholder="https://zoom.us/rec/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                  value={formData.recording_date}
                  onChange={(e) => setFormData({ ...formData, recording_date: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
              <textarea
                placeholder="Topics covered..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm resize-none h-20"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload Recording
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
