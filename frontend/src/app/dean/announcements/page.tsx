"use client";

import { useState } from "react";
import { Megaphone, Send, Users, Filter, CheckCircle2 } from "lucide-react";

const existingAnnouncements = [
  { title: "NAAC Compliance Documentation Drive", target: "All Faculty", date: "Jan 22, 2024", type: "Academic", priority: "high" },
  { title: "Second Internal Examination Schedule — Sem 5", target: "All Students", date: "Jan 20, 2024", type: "Examination", priority: "high" },
  { title: "Republic Day Holiday — Jan 26, 2024", target: "Everyone", date: "Jan 19, 2024", type: "Holiday", priority: "normal" },
  { title: "Campus Placement Drive — TCS & Infosys — Jan 30", target: "Graduating Students", date: "Jan 18, 2024", type: "Placement", priority: "high" },
  { title: "Academic Calendar Revision — Q2 2024", target: "Faculty & HODs", date: "Jan 15, 2024", type: "Policy", priority: "normal" },
  { title: "Emergency: Attendance Policy Update", target: "All Students", date: "Jan 12, 2024", type: "Emergency", priority: "critical" },
];

const priorityColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("All Students");
  const [type, setType] = useState("Academic");
  const [priority, setPriority] = useState("normal");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title || !body) return;
    setSent(true);
    setTimeout(() => { setSent(false); setTitle(""); setBody(""); }, 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Announcements</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Broadcast institution-wide notices, circulars, and alerts</p>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Megaphone size={16} className="text-violet-600" />
          <h3 className="font-bold text-zinc-900">Compose Announcement</h3>
        </div>
        <div className="space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title..." className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-violet-400 font-semibold" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
            placeholder="Write announcement content here..."
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-violet-400 resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Target Audience</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
                <option>All Students</option>
                <option>All Faculty</option>
                <option>Everyone</option>
                <option>HODs Only</option>
                <option>Graduating Students</option>
                <option>CSE Department</option>
                <option>Mechanical Department</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
                <option>Academic</option>
                <option>Examination</option>
                <option>Holiday</option>
                <option>Placement</option>
                <option>Emergency</option>
                <option>Policy</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-violet-400">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical / Emergency</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSend}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                sent ? "bg-emerald-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}>
              {sent ? <><CheckCircle2 size={15} /> Sent!</> : <><Send size={14} /> Broadcast Announcement</>}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">Recent Announcements</h3>
          <span className="text-xs text-zinc-400">{existingAnnouncements.length} total</span>
        </div>
        <div className="divide-y divide-zinc-50">
          {existingAnnouncements.map((a, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors">
              <div className={`mt-0.5 text-[10px] font-black px-2 py-1 rounded-lg border uppercase flex-shrink-0 ${priorityColors[a.priority as keyof typeof priorityColors]}`}>
                {a.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{a.title}</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1"><Users size={10} /> {a.target}</span>
                  <span className="text-[10px] text-zinc-400">{a.type}</span>
                  <span className="text-[10px] text-zinc-400">{a.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
