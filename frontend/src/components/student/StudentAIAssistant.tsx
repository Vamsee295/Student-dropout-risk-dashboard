"use client";

import { useState } from "react";
import { Cpu, X, Send, Sparkles, ChevronDown } from "lucide-react";

const quickPrompts = [
  "Why has my risk increased?",
  "How many classes should I attend?",
  "What should I do today?",
  "Summarize my weak subjects",
  "Create a study plan for this week",
  "Prepare me for tomorrow's quiz",
  "How am I performing this semester?",
  "Am I ready for placements?",
];

const mockReplies: Record<string, string> = {
  "Why has my risk increased?":
    "📊 Your dropout risk increased slightly due to: (1) Machine Learning attendance dropped to 68% — below the 75% threshold. (2) Assignment #4 was submitted 2 days late. (3) Your LMS login activity decreased by 30% compared to last week. I recommend attending the next 3 ML lectures and completing pending quizzes.",
  "How many classes should I attend?":
    "📅 You need to attend **12 consecutive classes** in Machine Learning to bring your attendance from 68% to 75%. For all other subjects, you're currently at 82% average — maintain at least 80% attendance each week to stay safe.",
  "What should I do today?":
    "✅ Today's Priority List:\n1. Submit Assignment #4 (due tonight at 11:59 PM)\n2. Attend OS lecture at 2:00 PM – Room LH-105\n3. Spend 45 minutes reviewing Data Structures\n4. Check faculty feedback on Quiz 2\n5. Review AI Success Coach weekly goals",
  "Summarize my weak subjects":
    "⚠️ Your weaker subjects based on current performance:\n- **Machine Learning** — 68% attendance, 52/100 avg marks\n- **Mathematics III** — 61/100 avg marks (below class average)\n- **Networks Lab** — 72% attendance (borderline)\n\n💡 Recommendation: Dedicate 2 extra study hours per week to ML and Math.",
};

export function StudentAIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "👋 Hi! I'm your AI Success Coach. I can help you understand your academic performance, plan your studies, analyze your risk level, and prepare for placements. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply =
        mockReplies[text] ||
        `🤖 Analyzing your academic profile for: "${text}"\n\nBased on your current data — attendance 78%, CGPA 8.2, dropout risk 14% (Low) — you are performing well overall. Keep maintaining consistent attendance and complete all assignments on time to stay on track for graduation.`;
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-900/25 transition-all hover:scale-105 font-semibold text-sm"
      >
        <Cpu size={18} />
        AI Coach
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[580px] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Cpu size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">AI Success Coach</p>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Personalized to your profile
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2.5 border-b border-slate-100 bg-blue-50/50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Quick Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="text-[10px] font-medium px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Sparkles size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={12} />
                </div>
                <div className="flex gap-1 px-3 py-2.5 bg-white border border-slate-100 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-400 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask your AI coach..."
                className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="p-1.5 rounded-lg bg-blue-600 disabled:bg-slate-200 text-white transition-colors hover:bg-blue-700"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
