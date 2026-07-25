"use client";

import { useState } from "react";
import { Send, Search, Star, MessageSquare, Paperclip, Phone, Video } from "lucide-react";

const contacts = [
  { id: 1, name: "Dr. Ramesh Kumar", role: "DBMS Faculty", avatar: "RK", online: true, unread: 2,
    lastMessage: "Please submit your assignment by tonight.", time: "10:32 AM" },
  { id: 2, name: "Prof. Ananya Sharma", role: "OS Faculty", avatar: "AS", online: false, unread: 0,
    lastMessage: "Lab report feedback has been uploaded.", time: "Yesterday" },
  { id: 3, name: "Dr. Vikram Nair", role: "ML Faculty", avatar: "VN", online: true, unread: 1,
    lastMessage: "Your attendance is borderline. Please attend next week.", time: "Yesterday" },
  { id: 4, name: "Academic Advisor", role: "Student Services", avatar: "AA", online: true, unread: 0,
    lastMessage: "Your advising session is scheduled for Jan 28.", time: "Jan 20" },
  { id: 5, name: "Placement Cell", role: "Careers Office", avatar: "PC", online: false, unread: 3,
    lastMessage: "Google internship applications are now open.", time: "Jan 19" },
];

const convos: Record<number, { role: "user" | "other"; text: string; time: string }[]> = {
  1: [
    { role: "other", text: "Hello, how are you progressing with the DBMS project?", time: "10:00 AM" },
    { role: "user", text: "Sir, I have started the ER diagram. Should be done by tomorrow.", time: "10:15 AM" },
    { role: "other", text: "Good. Please submit your assignment by tonight. The portal closes at 11:59 PM.", time: "10:32 AM" },
  ],
  3: [
    { role: "other", text: "I noticed your ML attendance has dropped to 68%. This is below the required 75%.", time: "Yesterday" },
    { role: "user", text: "Sorry sir, I was unwell last week. I will make sure to attend all classes from now.", time: "Yesterday" },
    { role: "other", text: "Your attendance is borderline. Please attend next week's lectures without fail.", time: "Yesterday" },
  ],
};

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState(1);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState(convos);
  const [search, setSearch] = useState("");

  const current = contacts.find((c) => c.id === activeContact)!;
  const currentMsgs = msgs[activeContact] || [];

  const sendMsg = () => {
    if (!input.trim()) return;
    setMsgs((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), { role: "user", text: input.trim(), time: "Just now" }],
    }));
    setInput("");
  };

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-400 mt-0.5">Communicate with faculty and academic staff</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[600px]">
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..." className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setActiveContact(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeContact === c.id ? "bg-blue-50" : ""}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{c.avatar}</div>
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                    <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{current.avatar}</div>
                {current.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{current.name}</p>
                <p className="text-[10px] text-slate-400">{current.role} · {current.online ? "Online" : "Offline"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"><Phone size={16} /></button>
              <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"><Video size={16} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/30">
            {currentMsgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={40} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No messages yet</p>
                <p className="text-xs text-slate-300 mt-1">Send a message to start the conversation</p>
              </div>
            ) : (
              currentMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm"
                  }`}>
                    <p>{m.text}</p>
                    <p className={`text-[9px] mt-1 ${m.role === "user" ? "text-blue-200" : "text-slate-400"}`}>{m.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition-colors">
              <button className="text-slate-400 hover:text-blue-600"><Paperclip size={15} /></button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Type a message..."
                className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400" />
              <button onClick={sendMsg} disabled={!input.trim()}
                className="p-1.5 rounded-lg bg-blue-600 disabled:bg-slate-200 text-white hover:bg-blue-700 transition-colors">
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
