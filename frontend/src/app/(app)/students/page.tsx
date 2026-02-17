"use client";

import { useEffect, useState } from "react";
import { facultyService, type StudentSummary } from "@/services/faculty";
import { Loader2, Search, Filter, AlertTriangle, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export default function StudentListPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await facultyService.getStudents(
          departmentFilter || undefined,
          riskFilter || undefined
        );
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [departmentFilter, riskFilter]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500">View and manage student risk profiles.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Moderate Risk">Moderate Risk</option>
            <option value="Low Risk">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Link href={`/students/${student.id}`} key={student.id} className="block group">
              <div className={`h-full bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 p-6 flex flex-col ${student.risk_level === 'High Risk' ? 'border-red-100' :
                student.risk_level === 'Moderate Risk' ? 'border-amber-100' :
                  'border-green-100'
                }`}>
                <div className="flex items-start justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xl text-indigo-600 font-bold shadow-inner ring-1 ring-black/5 group-hover:scale-110 transition-transform">
                    {student.name.charAt(0)}
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5 ${student.risk_level === 'High Risk' ? 'bg-red-50 text-red-700 border border-red-100' :
                    student.risk_level === 'Moderate Risk' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                    {student.risk_level === 'High Risk' && <AlertTriangle size={12} />}
                    {student.risk_level === 'Low Risk' && <ShieldCheck size={12} />}
                    {student.risk_level}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                <p className="text-sm font-medium text-gray-500 mb-6">{student.id} • {student.department}</p>

                <div className="mt-auto pt-5 border-t border-gray-100 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 leading-none">Risk Score</p>
                    <p className={`text-lg font-black ${student.risk_score > 75 ? 'text-red-600' :
                      student.risk_score > 50 ? 'text-amber-600' :
                        'text-green-600'
                      }`}>{Math.round(student.risk_score)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 leading-none">Attendance</p>
                    <p className="text-lg font-black text-gray-900">
                      {typeof student.attendance === 'number' ? student.attendance.toFixed(1) : student.attendance}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>VIEW FULL PROFILE</span>
                  <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Search size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            <User size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No students found.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
