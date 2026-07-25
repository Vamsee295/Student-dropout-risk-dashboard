"use client";

import { useState } from "react";
import { BrainCircuit, X, Send, Sparkles, Cpu } from "lucide-react";

const quickPrompts = [
  "Which department has highest dropout risk?",
  "Generate executive summary",
  "Predict next semester retention",
  "Compare CSE and Mechanical",
  "Which faculty need support?",
  "Recommend budget allocation",
  "Generate NAAC readiness summary",
  "Show institution health score",
];

const mockReplies: Record<string, string> = {
  "Which department has highest dropout risk?":
    "🏫 Institutional Risk Analysis:\n\n1. **Mechanical Engineering** — 24% dropout risk (Highest)\n   - Attendance dropped to 67% this semester\n   - Internal marks avg: 58/100\n   - Recommendation: Deploy 2 additional mentors, increase counselling sessions\n\n2. **Civil Engineering** — 21% risk (High)\n   - 12% increase since last semester\n   - Low engagement score: 52%\n\n3. **ECE** — 18% risk (Moderate)\n\nCSE remains strongest at 11% risk.",
  "Generate executive summary":
    "📊 Executive Summary — January 2024\n\n✅ Institution Health Score: 87/100 (Good)\n📉 Dropout Rate: 12.4% (↓ 3% from last semester)\n🎓 Graduation Rate: 91% (Above Target)\n💼 Placement Rate: 84% (↑ 6%)\n\n⚠ Priority Actions:\n1. Mechanical Engineering requires immediate intervention (24% risk)\n2. First-year students across all departments show 19% higher dropout probability\n3. AI recommends expanding peer mentoring program\n\n📈 Prediction: With current trend, dropout will fall to 9.8% by May 2024.",
  "Predict next semester retention":
    "🔮 AI Retention Forecast — Semester 6 (Feb–May 2024):\n\nProjected Retention Rate: **91.2%** (↑ from 88.5%)\n\nKey Drivers:\n- Attendance intervention program shows +6% improvement\n- New scholarship scheme reduces financial dropout by est. 40%\n- ML-driven early warning system identifying at-risk students 6 weeks earlier\n\nConfidence: 87%\nModel: EduRisk v2.3 (last trained: Jan 15, 2024)",
  "Compare CSE and Mechanical":
    "📊 Department Comparison:\n\n| Metric | CSE | Mechanical |\n|--------|-----|------------|\n| Students | 480 | 320 |\n| Dropout Risk | 11% | 24% |\n| Avg Attendance | 84% | 67% |\n| CGPA Avg | 8.1 | 6.9 |\n| Placement | 92% | 71% |\n| Faculty Ratio | 1:18 | 1:27 |\n\n🔴 Mechanical requires urgent resource allocation: recruit 2 faculty, increase lab access, deploy mentoring program.",
  "Recommend budget allocation":
    "💰 AI Budget Recommendation (FY 2024-25):\n\n1. Mechanical Lab Upgrade: +₹15L (Critical — outdated equipment)\n2. Faculty Recruitment (Mech & Civil): +₹24L (Fill 3 vacancies)\n3. Peer Mentoring Program: +₹8L (High ROI — 4% dropout reduction)\n4. AI & DS Lab Expansion: +₹12L (Demand growing 40%/year)\n5. Scholarship Fund Increase: +₹20L (Reduces financial dropout)\n\nTotal Recommended: ₹79L additional allocation\nProjected Impact: 3.2% dropout reduction",
};

export function DeanAIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "👑 Welcome, Dean. I am your AI Executive Assistant. I can analyze institutional performance, forecast dropout trends, compare departments, evaluate faculty, simulate policy impacts, and generate executive reports. What strategic insight do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply =
        mockReplies[text] ||
        `🤖 Analyzing institutional data for: "${text}"\n\nBased on current metrics — Institution Health Score: 87/100, Dropout Rate: 12.4%, Retention: 88.5%, Placement: 84% — your institution is performing above the national benchmark. For specific analysis, please use the AI Intelligence Center module for deeper SHAP-based explainability and policy simulation.`;
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsTyping(false);
    }, 1400);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-violet-700 hover:bg-violet-600 text-white rounded-2xl shadow-xl shadow-violet-900/40 transition-all hover:scale-105 font-semibold text-sm border border-violet-500"
      >
        <BrainCircuit size={18} />
        AI Executive
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[600px] flex flex-col bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-violet-800 to-violet-900 text-white border-b border-violet-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/50 border border-violet-500 flex items-center justify-center">
                <BrainCircuit size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">AI Executive Assistant</p>
                <p className="text-[10px] text-violet-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Institutional Intelligence Active
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-violet-700/50 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-2">Strategic Queries</p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.slice(0, 4).map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  className="text-[10px] font-medium px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-violet-300 rounded-full hover:bg-violet-700 hover:text-white hover:border-violet-600 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-950/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-lg bg-violet-800 border border-violet-700 text-violet-300 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-violet-700 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-800 border border-violet-700 flex items-center justify-center">
                  <Sparkles size={12} className="text-violet-300" />
                </div>
                <div className="flex gap-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask your executive AI..."
                className="flex-1 text-xs bg-transparent outline-none text-zinc-200 placeholder-zinc-600" />
              <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                className="p-1.5 rounded-lg bg-violet-700 disabled:bg-zinc-700 text-white transition-colors hover:bg-violet-600">
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
