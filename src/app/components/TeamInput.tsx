"use client";

import { useState } from "react";

interface Message {
  author: string;
  initials: string;
  text: string;
  time: string;
  type: "signal" | "note" | "query";
}

const presetMessages: Message[] = [
  {
    author: "Hammon",
    initials: "HD",
    text: "Soy drought signal confirmed via local contacts in MT. Increase \u03C3 weight.",
    time: "12:42",
    type: "signal",
  },
  {
    author: "Rafael",
    initials: "RM",
    text: "MC convergence at 10K paths. P95 band: $82-$97 for ZS.",
    time: "12:38",
    type: "note",
  },
  {
    author: "Yuki",
    initials: "YM",
    text: "AIS data shows 3 bulk carriers delayed at Santos port. Correlates with soy news.",
    time: "12:35",
    type: "signal",
  },
];

export default function TeamInput() {
  const [messages, setMessages] = useState<Message[]>(presetMessages);
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<"signal" | "note" | "query">("note");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg: Message = {
      author: "You",
      initials: "ME",
      text: input,
      time: timeStr,
      type: selectedType,
    };

    setMessages([newMsg, ...messages]);
    setInput("");
  };

  const typeColors = {
    signal: "bg-red-500/15 text-red-400 border-red-500/20",
    note: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    query: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-2 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-green-500/15 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-400 flex-shrink-0 mt-0.5">
              {msg.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-gray-300">{msg.author}</span>
                <span className={`text-[7px] font-mono px-1 py-0.5 rounded border ${typeColors[msg.type]}`}>
                  {msg.type.toUpperCase()}
                </span>
                <span className="text-[8px] text-gray-700 ml-auto">{msg.time}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {(["signal", "note", "query"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                selectedType === t
                  ? typeColors[t]
                  : "text-gray-600 border-white/[0.05] bg-transparent hover:border-white/10"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share a signal, note, or query..."
            className="flex-1 text-[11px] font-mono bg-white/[0.03] border border-white/[0.08] rounded-md px-2.5 py-2 text-gray-300 placeholder-gray-600 outline-none focus:border-green-500/30 transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 text-[10px] font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/20 rounded-md hover:bg-green-500/25 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
