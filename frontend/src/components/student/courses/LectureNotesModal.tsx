import React, { useEffect, useState } from "react";
import { X, FileText, Download, Loader2, BookOpen } from "lucide-react";
import apiClient from "@/api/axios";

interface Material {
  id: number;
  title: string;
  description: string;
  file_url: string;
  material_type: string;
  unit: string;
  created_at: string;
}

interface Props {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export default function LectureNotesModal({ courseId, courseName, onClose }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/lms/courses/${courseId}/materials`);
        setMaterials(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? "Failed to load materials");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  // Group materials by unit
  const grouped = materials.reduce((acc, m) => {
    const unit = m.unit || "General Notes";
    if (!acc[unit]) acc[unit] = [];
    acc[unit].push(m);
    return acc;
  }, {} as Record<string, Material[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              Lecture Notes
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
              <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
              <p className="text-sm font-medium">Loading course materials...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No lecture notes available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check back later for updates from your faculty.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([unit, items]) => (
                <div key={unit}>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                    {unit}
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{items.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((m) => (
                      <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate" title={m.title}>{m.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description || "PDF Document"}</p>
                            
                            <div className="flex items-center gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                              <a href={m.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors">
                                <FileText size={12} /> View
                              </a>
                              <a href={m.file_url} download className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors">
                                <Download size={12} /> Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
