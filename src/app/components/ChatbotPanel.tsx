"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const starterMessage: ChatMessage = {
  role: "assistant",
  content: "Ask me about a commodity + region (for example: soybean outlook in Brazil).",
};

export default function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const payload = (await response.json()) as { reply?: string };
      const reply = payload.reply?.trim() || "I could not generate a response.";

      setMessages((previous) => [...previous, { role: "assistant", content: reply }]);

      if (!response.ok) {
        setError("Chat service returned an error. The response above may be partial.");
      }
    } catch {
      setError("Chat request failed. Please try again.");
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "Network error while reaching chat service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-1.5rem)] h-[460px] rounded-xl border border-cyan-500/20 bg-[#090d0f]/95 backdrop-blur-sm shadow-[0_10px_35px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-cyan-500/15 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 3.5h11v7h-6l-3 2v-2h-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
                  Commodity Chatbot
                </h2>
                <p className="text-[8px] font-mono text-cyan-300/80">SHISA</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10 text-xs font-mono"
              aria-label="Close chatbot"
            >
              x
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`p-2 rounded border text-[11px] font-mono leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-white/[0.02] border-white/[0.08] text-gray-300"
                    : "bg-cyan-500/10 border-cyan-500/25 text-cyan-200"
                }`}
              >
                <span className={`mr-1 ${message.role === "assistant" ? "text-cyan-400" : "text-cyan-200"}`}>
                  {message.role === "assistant" ? "AI" : "YOU"}
                </span>
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded border bg-white/[0.02] border-white/[0.08] text-[11px] font-mono text-gray-500">
                AI is thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-white/10 bg-black/20">
            {error && <p className="text-[10px] font-mono text-red-400 mb-2">{error}</p>}

            <div className="flex gap-1.5">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask commodity + region..."
                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-mono text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/40"
              />
              <button
                onClick={() => {
                  void sendMessage();
                }}
                disabled={loading || input.trim().length === 0}
                className="px-3 py-1.5 text-[10px] font-mono rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="w-12 h-12 rounded-lg border border-cyan-500/30 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? (
          <span className="text-xl leading-none">x</span>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 5h16v10H9l-5 4v-4H4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
