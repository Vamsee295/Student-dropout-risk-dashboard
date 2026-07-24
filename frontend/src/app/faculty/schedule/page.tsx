"use client";

import { CalendarDays, Plus, Clock, Users, MapPin, ChevronRight } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const timetable: Record<string, Record<string, { subject: string; room: string; color: string } | null>> = {
  "09:00": { Mon: { subject: "DBMS – CS301", room: "LH-203", color: "blue" }, Tue: null, Wed: { subject: "DBMS – CS301", room: "LH-203", color: "blue" }, Thu: null, Fri: { subject: "DBMS – CS301", room: "LH-203", color: "blue" } },
  "11:00": { Mon: null, Tue: { subject: "OS – CS302", room: "LH-105", color: "purple" }, Wed: null, Thu: { subject: "OS – CS302", room: "LH-105", color: "purple" }, Fri: null },
  "14:00": { Mon: { subject: "Networks Lab", room: "Lab-04", color: "amber" }, Tue: null, Wed: null, Thu: { subject: "Networks Lab", room: "Lab-04", color: "amber" }, Fri: null },
  "15:00": { Mon: null, Tue: null, Wed: null, Thu: null, Fri: { subject: "Office Hours", room: "Faculty Room", color: "emerald" } },
};

const upcomingMeetings = [
  { student: "Arjun Mehta", type: "Risk Counselling", date: "Jan 24", time: "10:00 AM", status: "Confirmed" },
  { student: "Priya Sharma", type: "Academic Review", date: "Jan 25", time: "2:00 PM", status: "Pending" },
  { student: "CS301 Class", type: "Revision Session", date: "Jan 26", time: "11:00 AM", status: "Confirmed" },
];

const cellColor: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule & Timetable</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your classes, meetings, and office hours</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
          <Plus size={14} /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-500" /> Weekly Timetable
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="text-xs font-semibold text-slate-400 py-2 text-center">Time</div>
                {days.map((d) => (
                  <div key={d} className="text-xs font-bold text-slate-600 py-2 text-center bg-slate-50 rounded-lg">{d}</div>
                ))}
              </div>

              {/* Time slots */}
              {hours.map((hour) => {
                const row = timetable[hour];
                return (
                  <div key={hour} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-xs text-slate-400 font-mono py-2 text-center self-center">{hour}</div>
                    {days.map((day) => {
                      const cell = row?.[day];
                      if (!cell) return <div key={day} className="h-14 rounded-lg border border-dashed border-slate-100" />;
                      return (
                        <div key={day} className={`h-14 rounded-lg border px-2 py-1.5 text-xs font-medium ${cellColor[cell.color]}`}>
                          <p className="font-bold truncate leading-tight">{cell.subject}</p>
                          <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5"><MapPin size={8} />{cell.room}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings + Office Hours */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
              <Users size={16} className="text-emerald-600" /> Upcoming Meetings
            </h3>
            <div className="space-y-3">
              {upcomingMeetings.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.student}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      m.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>{m.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays size={10} />{m.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">
              <Plus size={12} /> Schedule Meeting
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <Clock size={16} className="text-purple-600" /> Office Hours
            </h3>
            <div className="space-y-2">
              {[
                { day: "Tuesday", time: "2:00 – 4:00 PM" },
                { day: "Friday", time: "3:00 – 5:00 PM" },
              ].map((oh, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">{oh.day}</p>
                    <p className="text-xs text-purple-600">{oh.time}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Open</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
