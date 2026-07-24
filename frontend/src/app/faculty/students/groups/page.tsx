"use client";

import { useState } from "react";
import { UsersRound, Plus, MessageSquare, CalendarCheck, FileText, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

const groups = [
  {
    id: 1, name: "CSE - Section A", course: "CS301 / CS302 / CS303", students: 32, atRisk: 4,
    avgAttendance: 78, section: "A", color: "blue",
    memberList: ["Arjun Mehta", "Aditi Singh", "Vikas Reddy", "Meera Nair", "Raj Patel", "Priya Sharma"],
  },
  {
    id: 2, name: "CSE - Section B", course: "CS301 / CS302 / CS303", students: 30, atRisk: 7,
    avgAttendance: 71, section: "B", color: "red",
    memberList: ["Rohit Kumar", "Kavya Reddy", "Sanjay Patel", "Deepika Nair", "Kiran Kumar", "Anjali Rao"],
  },
  {
    id: 3, name: "Data Science Project Team", course: "CS303 / HS101", students: 8, atRisk: 1,
    avgAttendance: 85, section: "Project", color: "emerald",
    memberList: ["Vikas Reddy", "Meera Nair", "Aditi Singh", "Kiran Kumar"],
  },
  {
    id: 4, name: "Machine Learning Club", course: "Elective / Extra Curricular", students: 15, atRisk: 0,
    avgAttendance: 90, section: "Club", color: "purple",
    memberList: ["Aditi Singh", "Raj Patel", "Vikas Reddy"],
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  red: "bg-red-50 border-red-100 text-red-700",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
};

const borderLeft: Record<string, string> = {
  blue: "border-l-blue-400",
  red: "border-l-red-500",
  emerald: "border-l-emerald-400",
  purple: "border-l-purple-400",
};

export default function StudentGroupsPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Groups</h1>
          <p className="text-sm text-slate-500 mt-1">Manage sections, project teams, and clubs for bulk operations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
          <Plus size={14} /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {groups.map((group) => (
          <div key={group.id} className={`bg-white rounded-2xl border border-l-4 border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer ${borderLeft[group.color]}`}
            onClick={() => setSelected(selected === group.id ? null : group.id)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-lg border mb-2 ${colorMap[group.color]}`}>{group.section}</div>
                <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{group.course}</p>
              </div>
              <ChevronRight size={18} className={`text-slate-400 transition-transform ${selected === group.id ? "rotate-90" : ""}`} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-bold text-slate-900">{group.students}</p>
                <p className="text-[10px] text-slate-400 font-medium">Students</p>
              </div>
              <div className={`text-center p-3 rounded-xl ${group.atRisk > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                <p className={`text-lg font-bold ${group.atRisk > 0 ? "text-red-600" : "text-emerald-600"}`}>{group.atRisk}</p>
                <p className="text-[10px] text-slate-400 font-medium">At Risk</p>
              </div>
              <div className={`text-center p-3 rounded-xl ${group.avgAttendance < 75 ? "bg-red-50" : "bg-emerald-50"}`}>
                <p className={`text-lg font-bold ${group.avgAttendance < 75 ? "text-red-600" : "text-emerald-600"}`}>{group.avgAttendance}%</p>
                <p className="text-[10px] text-slate-400 font-medium">Attendance</p>
              </div>
            </div>

            {/* Members Preview */}
            {selected === group.id && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Members</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.memberList.map((m, i) => (
                    <span key={i} className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">{m}</span>
                  ))}
                  {group.students > group.memberList.length && (
                    <span className="text-xs bg-white border border-slate-200 text-slate-400 px-2.5 py-1 rounded-full">+{group.students - group.memberList.length} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
              <Link href="/faculty/communication" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-100">
                <MessageSquare size={12} /> Message All
              </Link>
              <Link href="/faculty/attendance" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100">
                <CalendarCheck size={12} /> Bulk Attendance
              </Link>
              <Link href="/faculty/reports" className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg font-medium hover:bg-amber-100">
                <FileText size={12} /> Group Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
