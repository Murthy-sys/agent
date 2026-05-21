import type { Message } from "../types";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-neutral-800 text-neutral-100 border border-white/5"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
