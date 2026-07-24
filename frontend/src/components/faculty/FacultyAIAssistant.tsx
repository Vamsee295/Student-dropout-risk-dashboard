"use client";

import { useState } from "react";
import { Brain, X, Send, Sparkles, TrendingDown, AlertTriangle, Users } from "lucide-react";

const QUICK_QUERIES = [
  "Which students are most likely to drop out?",
  "Show students with attendance below 70%",
  "Which assignment has lowest completion rate?",
  "Recommend interventions for high-risk students",
  "Compare attendance across all courses",
];

interface Message {
  role: "user" | "assistant";
  text: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  "Which students are most likely to drop out?":
    "Based on the AI model, 6 students show critical dropout probability above 80%: Arjun Mehta (92%), Priya Sharma (88%), Rohit Kumar (84%), Kavya Reddy (82%), Sanjay Patel (81%), Deepika Nair (80%). I recommend scheduling immediate counselling sessions for all 6 this week.",
  "Show students with attendance below 70%":
    "12 students have attendance below 70% threshold: CS301 has 4 students, CS302 has 5 students, HS101 has 3 students. The most critical case is Rohit Kumar at 51% attendance. Sending automated warnings is recommended.",
  "Which assignment has lowest completion rate?":
    "Assignment: 'Database Design Project' (CS301) has the lowest completion at 34%. Due date was 3 days ago. 18 students have not submitted. Late submission penalty policy may need review.",
  "Recommend interventions for high-risk students":
    "Priority interventions: (1) Schedule one-on-one counselling for top 5 at-risk students. (2) Notify parents of students with >3 consecutive absences. (3) Assign peer mentors to students with declining grades. (4) Create a weekly check-in schedule for moderate-risk students.",
  "Compare attendance across all courses":
    "CS301 (DBMS): 81% avg attendance | CS302 (OS): 74% avg attendance | CS303 (Networks): 68% avg attendance ⚠️ | HS101 (Tech Comm): 85% avg attendance. CS303 is below the 75% threshold and needs immediate attention.",
};

export function FacultyAIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I'm your AI Academic Assistant. Ask me about student risk, attendance patterns, assignment completion, or intervention recommendations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const handleSend = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    await new Promise((r) => setTimeout(r, 900));

    const responseText =
      MOCK_RESPONSES[query] ||
      "I'm analyzing the data... Based on current metrics, I recommend reviewing the student performance reports for more detailed insights. Check the AI Risk Center for full dropout probability analysis.";

    setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
    setThinking(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-3 shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-105"
      >
        <Sparkles size={18} />
        <span className="text-sm font-semibold">AI Assistant</span>
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Brain size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">EduRisk AI Assistant</p>
                <p className="text-xs text-emerald-200">Faculty Academic Intelligence</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Quick Query Chips */}
          <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto flex-shrink-0">
            {QUICK_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="flex-shrink-0 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors font-medium"
              >
                {q.length > 28 ? q.slice(0, 28) + "…" : q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Brain size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Brain size={14} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask about students, risk, attendance..."
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || thinking}
                className="flex-shrink-0 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
