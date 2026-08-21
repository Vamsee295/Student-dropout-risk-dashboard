import React, { useState } from "react";
import { X, Search, AlertTriangle, ShieldAlert, AlertCircle, Loader2 } from "lucide-react";
import { BelowThresholdStudent, CourseItem } from "@/services/attendanceService";

interface BelowThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: BelowThresholdStudent[];
  totalCount: number;
  courses: CourseItem[];
}

export function BelowThresholdModal({ isOpen, onClose, students, totalCount, courses }: BelowThresholdModalProps) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");

  if (!isOpen) return null;

  // Filter students based on search and course filter
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase());
      
    const matchesCourse = courseFilter === "ALL" || s.course_id === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  const getSeverityBadge = (severity: string) => {
    if (severity === "Critical") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
          <ShieldAlert size={12} /> Critical
        </span>
      );
    }
    if (severity === "High Risk") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
          <AlertTriangle size={12} /> High Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
        <AlertCircle size={12} /> At Risk
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={22} />
              Students Below 75%
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {totalCount} students require attention across courses
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, or course..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 cursor-pointer"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.display}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="text-slate-400" size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No students found</h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search or course filters.
              </p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-100">#</th>
                    <th className="px-4 py-3 border-b border-slate-100">Student</th>
                    <th className="px-4 py-3 border-b border-slate-100">Roll / ID</th>
                    <th className="px-4 py-3 border-b border-slate-100">Course</th>
                    <th className="px-4 py-3 border-b border-slate-100 text-right">Attendance</th>
                    <th className="px-4 py-3 border-b border-slate-100 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student, idx) => (
                    <tr key={`${student.student_id}-${student.course_id}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{student.name}</td>
                      <td className="px-4 py-4 text-slate-500 font-mono text-xs">{student.roll_number}</td>
                      <td className="px-4 py-4 text-slate-600">{student.course}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-bold ${
                          student.attendance_percentage < 50 ? 'text-red-600' :
                          student.attendance_percentage < 60 ? 'text-orange-600' : 'text-amber-600'
                        }`}>
                          {student.attendance_percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getSeverityBadge(student.severity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
