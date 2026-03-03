"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChatMessage } from "@/types";

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Append a blank assistant bubble immediately
      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: assistantContent }]);
      }
    } catch (err) {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: `Error: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="fixed right-0 top-14 w-[22rem] h-[calc(100vh-3.5rem)] border-l border-[#e5e7eb] bg-[#fafafa] flex flex-col z-40">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e7eb] text-center">
        <p className="text-base font-semibold text-[#111827]">Chat with William</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="pt-4 text-center">
            <p className="text-sm text-[#6b7280]">
              Ask me anything about my background or experience.
            </p>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-[#2563eb] text-white shadow-sm">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start items-start">
              <Image
                src="/avatar.jpg"
                alt="William"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover mr-2 self-start mt-0.5 flex-shrink-0"
              />
              <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-[#f0f4ff] border border-[#dbeafe] text-[#111827] shadow-sm">
                {msg.content}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex justify-start items-start">
            <Image
              src="/avatar.jpg"
              alt="William"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover mr-2 self-start mt-0.5 flex-shrink-0"
            />
            <div className="bg-[#f0f4ff] border border-[#dbeafe] px-4 py-3 rounded-2xl shadow-sm">
              <span className="flex gap-1 items-center px-1">
                <span className="w-1.5 h-1.5 bg-[#93c5fd] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#93c5fd] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#93c5fd] rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#e5e7eb] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-[#e5e7eb] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="py-2.5 px-4 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </aside>
  );
}
