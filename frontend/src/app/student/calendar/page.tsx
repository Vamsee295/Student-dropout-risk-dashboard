"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";

const typeColors: Record<string, string> = {
  class: "bg-blue-100 text-blue-700 border-blue-200",
  assignment: "bg-amber-100 text-amber-700 border-amber-200",
  exam: "bg-red-100 text-red-700 border-red-200",
  meeting: "bg-purple-100 text-purple-700 border-purple-200",
  holiday: "bg-emerald-100 text-emerald-700 border-emerald-200",
  career_event: "bg-indigo-100 text-indigo-700 border-indigo-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const typeDots: Record<string, string> = {
  class: "bg-blue-400",
  assignment: "bg-amber-400",
  exam: "bg-red-400",
  meeting: "bg-purple-400",
  holiday: "bg-emerald-400",
  career_event: "bg-indigo-400",
  other: "bg-slate-400",
};

export default function CalendarPage() {
  const { events, loading } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to get events for a specific day
  const dayEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  // Helper for formatting YYYY-MM-DD
  const formatDateString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const selectedEvents = dayEvents(selectedDate.getDate());
  
  // Upcoming events from today onwards
  const todayStr = formatDateString(new Date());
  const upcomingEvents = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  if (loading && events.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Calendar</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track all deadlines, exams, and important dates</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeColors).map(([type, cls]) => (
          <span key={type} className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${cls}`}>
            {type.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">{monthName} {year}</h3>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
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
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              
              return (
                <button key={day} onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                    isSelected ? "bg-blue-600 text-white shadow-sm" :
                    isToday ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-slate-50 text-slate-700"
                  }`}>
                  {day}
                  {evts.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 px-1">
                      {evts.slice(0, 3).map((e, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${typeDots[e.event_type] || typeDots.other}`} />
                      ))}
                      {evts.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Events */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 mb-3">Events on {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No events on this day</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => (
                  <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${typeColors[e.event_type] || typeColors.other}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDots[e.event_type] || typeDots.other}`} />
                    <div className="flex-1 pr-2">
                      <p className="font-bold truncate">{e.title}</p>
                      {e.course_id && <p className="opacity-70 mt-0.5">{e.course_id}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {e.start_time ? (
                        <span className="font-mono font-semibold block">{e.start_time.slice(0, 5)}</span>
                      ) : (
                        <span className="font-semibold block uppercase text-[10px]">All Day</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming events found.</p>
            ) : (
              upcomingEvents.map((e) => (
                <div key={e.id} className={`p-3.5 rounded-xl border ${typeColors[e.event_type] || typeColors.other}`}>
                  <p className="text-xs font-bold truncate pr-2">{e.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] opacity-70 flex items-center gap-1">
                      {e.date.slice(5).replace("-", "/")}
                      {e.course_id && <span>• {e.course_id}</span>}
                    </p>
                    <p className="text-[10px] font-mono font-semibold">
                      {e.start_time ? e.start_time.slice(0, 5) : "All Day"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
