"use client";

import { useState } from "react";
import { CalendarDays, Plus, Clock, Users, MapPin, Trash2 } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { useFacultySchedule } from "@/hooks/useFacultySchedule";
import AddEventModal from "@/components/faculty/AddEventModal";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const cellColor: Record<string, string> = {
  class: "bg-blue-50 border-blue-200 text-blue-800",
  meeting: "bg-purple-50 border-purple-200 text-purple-800",
  exam: "bg-red-50 border-red-200 text-red-800",
  assignment: "bg-amber-50 border-amber-200 text-amber-800",
  holiday: "bg-emerald-50 border-emerald-200 text-emerald-800",
  career_event: "bg-indigo-50 border-indigo-200 text-indigo-800",
  other: "bg-slate-50 border-slate-200 text-slate-800",
};

export default function SchedulePage() {
  const { events, loading, refetch } = useCalendar();
  const { removeEvent } = useFacultySchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to format Date to YYYY-MM-DD (local timezone safe)
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get current week's Mon-Fri dates
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
  const monday = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
  
  const weekDates: Record<string, string> = {};
  days.forEach((day, index) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    weekDates[day] = formatDate(d);
  });

  // Map events to the timetable grid
  const getEventForSlot = (day: string, hourStr: string) => {
    const dateStr = weekDates[day];
    const hourNum = parseInt(hourStr.split(":")[0], 10);
    return events.find(e => {
      if (e.date !== dateStr) return false;
      if (!e.start_time) return false;
      const eventHour = parseInt(e.start_time.split(":")[0], 10);
      return eventHour === hourNum;
    });
  };

  // Get upcoming meetings specifically
  const upcomingMeetings = events
    .filter(e => e.event_type === "meeting" && new Date(e.date) >= new Date(formatDate(new Date())))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await removeEvent(id);
      refetch();
    }
  };

  if (loading && events.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule & Timetable</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your classes, meetings, and office hours</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
        >
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
                  <div key={d} className="flex flex-col items-center py-2 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-600">{d}</span>
                    <span className="text-[10px] text-slate-400">{weekDates[d].slice(5)}</span>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {hours.map((hour) => {
                return (
                  <div key={hour} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-xs text-slate-400 font-mono py-2 text-center self-center">{hour}</div>
                    {days.map((day) => {
                      const evt = getEventForSlot(day, hour);
                      if (!evt) return <div key={day} className="h-16 rounded-lg border border-dashed border-slate-100" />;
                      
                      const colorClass = cellColor[evt.event_type] || cellColor.other;
                      
                      return (
                        <div key={day} className={`relative h-16 rounded-lg border px-2 py-1.5 text-xs font-medium group ${colorClass}`}>
                          <p className="font-bold truncate leading-tight" title={evt.title}>{evt.title}</p>
                          <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={8} className="shrink-0" />
                            {evt.course_id || evt.event_type}
                          </p>
                          <button 
                            onClick={() => handleDelete(evt.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded-full bg-white/50 hover:bg-white transition-all"
                            title="Delete event"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings & Global Events */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
              <Users size={16} className="text-emerald-600" /> Upcoming Meetings
            </h3>
            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No upcoming meetings scheduled.</p>
              ) : (
                upcomingMeetings.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group relative">
                    <div className="flex items-start justify-between">
                      <div className="pr-6">
                        <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description || "Meeting"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays size={10} />{m.date}</span>
                      {m.start_time && <span className="flex items-center gap-1"><Clock size={10} />{m.start_time.slice(0, 5)}</span>}
                    </div>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={12} /> Schedule Meeting
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <CalendarDays size={16} className="text-purple-600" /> Other Upcoming Events
            </h3>
            <div className="space-y-2">
              {events
                .filter(e => e.event_type !== "meeting" && e.event_type !== "class" && new Date(e.date) >= new Date(formatDate(new Date())))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((evt) => (
                <div key={evt.id} className={`flex flex-col gap-1 p-3 border rounded-xl group relative ${cellColor[evt.event_type] || cellColor.other}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold truncate pr-6">{evt.title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 mix-blend-multiply uppercase tracking-wider">{evt.event_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 opacity-80">
                    <p className="text-xs">{evt.date}</p>
                    <p className="text-xs font-medium">{evt.course_id || ""}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(evt.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-600 transition-colors bg-white/60 hover:bg-white rounded p-0.5"
                    title="Delete event"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />
    </div>
  );
}
