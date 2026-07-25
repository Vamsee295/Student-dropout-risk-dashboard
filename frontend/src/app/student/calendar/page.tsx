"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const events = [
  { date: "2024-01-24", title: "Assignment #4 Due", type: "assignment", time: "11:59 PM", subject: "DBMS" },
  { date: "2024-01-25", title: "ML Internal Quiz", type: "exam", time: "10:00 AM", subject: "ML" },
  { date: "2024-01-28", title: "Advising Session", type: "meeting", time: "3:00 PM", subject: "" },
  { date: "2024-01-30", title: "OS Lab Exam", type: "exam", time: "9:00 AM", subject: "OS" },
  { date: "2024-02-05", title: "Mid-Semester Break", type: "holiday", time: "All Day", subject: "" },
  { date: "2024-02-10", title: "Google Internship Deadline", type: "career", time: "11:59 PM", subject: "" },
  { date: "2024-02-15", title: "Flipkart Application Deadline", type: "career", time: "11:59 PM", subject: "" },
  { date: "2024-02-20", title: "Networks Viva", type: "exam", time: "11:00 AM", subject: "Networks" },
];

const typeColors: Record<string, string> = {
  assignment: "bg-amber-100 text-amber-700 border-amber-200",
  exam: "bg-red-100 text-red-700 border-red-200",
  meeting: "bg-blue-100 text-blue-700 border-blue-200",
  holiday: "bg-emerald-100 text-emerald-700 border-emerald-200",
  career: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeDots: Record<string, string> = {
  assignment: "bg-amber-400",
  exam: "bg-red-400",
  meeting: "bg-blue-400",
  holiday: "bg-emerald-400",
  career: "bg-purple-400",
};

export default function CalendarPage() {
  const [month, setMonth] = useState(0); // 0 = Jan 2024
  const [selectedDay, setSelectedDay] = useState<number | null>(24);

  const months = ["January 2024", "February 2024", "March 2024"];
  const year = 2024;
  const monthIdx = 0 + month;

  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const dayEvents = (day: number) => {
    const dateStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDay ? dayEvents(selectedDay) : [];
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date("2024-01-24")).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Calendar</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track all deadlines, exams, and important dates</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeColors).map(([type, cls]) => (
          <span key={type} className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${cls}`}>{type}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">{months[month]}</h3>
            <div className="flex gap-1">
              <button onClick={() => setMonth(Math.max(0, month - 1))} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setMonth(Math.min(2, month + 1))} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const evts = dayEvents(day);
              const isSelected = selectedDay === day;
              const isToday = monthIdx === 0 && day === 24; // Mock today
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                    isSelected ? "bg-blue-600 text-white shadow-sm" :
                    isToday ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-slate-50 text-slate-700"
                  }`}>
                  {day}
                  {evts.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {evts.slice(0, 3).map((e, i) => (
                        <span key={i} className={`w-1 h-1 rounded-full ${typeDots[e.type]}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Events */}
          {selectedDay && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 mb-3">Events on Jan {selectedDay}, 2024</h4>
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-slate-400">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((e, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${typeColors[e.type]}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDots[e.type]}`} />
                      <div className="flex-1">
                        <p className="font-bold">{e.title}</p>
                        {e.subject && <p className="opacity-70">{e.subject}</p>}
                      </div>
                      <span className="font-mono font-semibold">{e.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((e, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${typeColors[e.type]}`}>
                <p className="text-xs font-bold">{e.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] opacity-70">{e.date.slice(5).replace("-", "/")}</p>
                  <p className="text-[10px] font-mono font-semibold">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
