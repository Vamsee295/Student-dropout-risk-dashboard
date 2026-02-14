"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, Minimize2, User } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'advisor';
    timestamp: Date;
}

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    advisorName: string;
    advisorRole: string;
}

export default function ChatWidget({ isOpen, onClose, advisorName, advisorRole }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello, I'm ${advisorName}. How can I help you with this student today?`,
            sender: 'advisor',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsTyping(true);

        // Mock advisor reply
        setTimeout(() => {
            const replies = [
                "I see. I'll take a look at their file right away.",
                "That's a good observation. Let's schedule a meeting to discuss this further.",
                "I've noted that down in the student's record.",
                "Thanks for bringing this to my attention.",
                "I'll reach out to the student directly regarding this."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            const advisorReply: Message = {
                id: (Date.now() + 1).toString(),
                text: randomReply,
                sender: 'advisor',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, advisorReply]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                            <User size={20} />
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{advisorName}</h3>
                        <p className="text-xs text-indigo-200">{advisorRole}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Minimize2 size={16} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 bg-gray-50 h-[350px] overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}
                        >
                            <p>{msg.text}</p>
                            <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
