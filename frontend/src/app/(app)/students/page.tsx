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
              <div className={`h-full bg-white rounded-xl border transition-all hover:shadow-md hover:border-indigo-200 p-5 flex flex-col ${student.risk_level === 'High Risk' ? 'border-red-100' :
                  student.risk_level === 'Moderate Risk' ? 'border-amber-100' :
                    'border-green-100'
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-500 font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${student.risk_level === 'High Risk' ? 'bg-red-100 text-red-700' :
                      student.risk_level === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    {student.risk_level === 'High Risk' && <AlertTriangle size={12} />}
                    {student.risk_level === 'Low Risk' && <ShieldCheck size={12} />}
                    {student.risk_level}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{student.id} • {student.department}</p>

                <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-semibold">Risk Score</p>
                    <p className={`font-bold ${student.risk_score > 75 ? 'text-red-600' :
                        student.risk_score > 50 ? 'text-amber-600' :
                          'text-green-600'
                      }`}>{student.risk_score}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs uppercase font-semibold">Attendance</p>
                    <p className="font-bold text-gray-900">{student.attendance}%</p>
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
