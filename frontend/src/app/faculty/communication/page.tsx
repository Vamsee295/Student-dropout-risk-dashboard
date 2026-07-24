"use client";

import { useState } from "react";
import { MessageSquare, Send, Search, Users, Bell, Plus, ChevronRight, CheckCheck } from "lucide-react";

const templates = [
  { title: "Attendance Warning", content: "Dear [Student Name], your current attendance is [X]%, which is below the required 75%. Please attend classes regularly to avoid academic consequences.", type: "warning" },
  { title: "Assignment Reminder", content: "Dear [Student Name], this is a reminder that your assignment '[Assignment Title]' is due on [Date]. Please submit on time to avoid penalties.", type: "info" },
  { title: "Risk Alert to Parent", content: "Dear Parent/Guardian, we are concerned about [Student Name]'s academic performance. Their attendance is [X]% and current risk level is HIGH. Please contact us.", type: "critical" },
  { title: "Meeting Invitation", content: "Dear [Student Name], you are invited to a mentoring session on [Date] at [Time] in [Location]. Your attendance is important for your academic progress.", type: "info" },
];

const inbox = [
  { from: "Arjun Mehta", message: "Sir, I was absent last week due to health issues. Can I get extension for the assignment?", time: "2h ago", unread: true, type: "student" },
  { from: "HOD Office", message: "Faculty meeting scheduled for Friday 3 PM. Attendance is mandatory.", time: "4h ago", unread: true, type: "admin" },
  { from: "Priya Sharma", message: "Thank you for the guidance in the last session. I will improve my attendance.", time: "1d ago", unread: false, type: "student" },
  { from: "Dept. Secretary", message: "Please submit student progress reports by end of this week.", time: "2d ago", unread: false, type: "admin" },
];

export default function CommunicationPage() {
  const [compose, setCompose] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication</h1>
          <p className="text-sm text-slate-500 mt-1">Message students, parents, and colleagues</p>
        </div>
        <button onClick={() => setCompose(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
          <Plus size={14} /> Compose
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" /> Inbox
            </h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search messages..." className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {inbox.map((msg, i) => (
              <div key={i} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${msg.unread ? "bg-blue-50/50" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                  msg.type === "admin" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {msg.from[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${msg.unread ? "text-slate-900" : "text-slate-700"}`}>{msg.from}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{msg.time}</span>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Templates Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={16} className="text-amber-500" /> Quick Templates
          </h3>
          <div className="space-y-3">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => { setMessage(tpl.content); setCompose(true); }}
                className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${
                  tpl.type === "critical" ? "bg-red-50 border-red-100 hover:border-red-200" :
                  tpl.type === "warning" ? "bg-amber-50 border-amber-100 hover:border-amber-200" :
                  "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <p className={`text-xs font-bold mb-1 ${
                  tpl.type === "critical" ? "text-red-700" :
                  tpl.type === "warning" ? "text-amber-700" : "text-slate-700"
                }`}>{tpl.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{tpl.content}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {compose && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setCompose(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Send size={18} className="text-emerald-600" /> New Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">To</label>
                <input type="text" placeholder="Student name, group, or parent email" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Subject</label>
                <input type="text" placeholder="Message subject" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 bg-slate-50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCompose(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Send size={14} /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
