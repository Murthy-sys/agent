import { useEffect, useRef, useState } from "react";
import type { Conversation } from "../types";
import MessageBubble from "./MessageBubble";

interface Props {
  conversation: Conversation | null;
  model: string;
  sending: boolean;
  error: string | null;
  onSend: (text: string) => void;
}

export default function ChatView({
  conversation,
  model,
  sending,
  error,
  onSend,
}: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation?.messages.length, sending]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  function submit() {
    const text = input.trim();
    if (!text || sending) return;
    onSend(text);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const messages = conversation?.messages ?? [];

  return (
    <section className="flex h-full flex-1 flex-col bg-neutral-900">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-neutral-200">
        <div className="text-sm font-medium">
          {conversation?.title || "New chat"}
        </div>
        <div className="text-xs text-neutral-500">{model}</div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <div className="mx-auto mt-20 max-w-md text-center text-neutral-400">
            <div className="mb-2 text-2xl font-semibold text-neutral-200">
              How can I help?
            </div>
            <div className="text-sm">
              Type a message below to start chatting.
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages
              .filter((m) => m.content || m.role !== "assistant")
              .map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            {sending && !messages[messages.length - 1]?.content && (
              <div className="flex w-full justify-start">
                <div className="rounded-2xl border border-white/5 bg-neutral-800 px-4 py-3 text-sm text-neutral-400">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="border-t border-white/10 bg-neutral-900 px-5 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message the assistant…  (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
            disabled={sending}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || sending}
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
