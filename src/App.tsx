import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import SettingsModal from "./components/SettingsModal";
import { sendChat } from "./lib/openai";
import type { Conversation, Message } from "./types";

const LS_MODEL = "agent.openai.model";
const LS_SYSTEM = "agent.openai.systemPrompt";

const apiKey: string = import.meta.env.VITE_OPENAI_API_KEY ?? "";

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function titleFromFirstMessage(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? t.slice(0, 40) + "…" : t;
}

export default function App() {
  const [model, setModel] = useState<string>(
    () => localStorage.getItem(LS_MODEL) ?? "gpt-4o-mini"
  );
  const [systemPrompt, setSystemPrompt] = useState<string>(
    () => localStorage.getItem(LS_SYSTEM) ?? ""
  );

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  function newConversation(): Conversation {
    const c: Conversation = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setError(null);
    return c;
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setError(null);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function clearAll() {
    setConversations([]);
    setActiveId(null);
  }

  async function handleSend(text: string) {
    if (!apiKey) {
      setError("VITE_OPENAI_API_KEY is not set. Add it to .env (local) or to Render's environment variables, then rebuild.");
      return;
    }

    let convo = active;
    if (!convo) convo = newConversation();
    const convoId = convo.id;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convoId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title:
                c.messages.length === 0 ? titleFromFirstMessage(text) : c.title,
            }
          : c
      )
    );

    setSending(true);
    setError(null);
    try {
      const history = [...(convo.messages ?? []), userMsg];
      const reply = await sendChat({
        apiKey,
        model,
        messages: history,
        systemPrompt: systemPrompt || undefined,
      });
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convoId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  function saveSettings(next: { model: string; systemPrompt: string }) {
    setModel(next.model);
    setSystemPrompt(next.systemPrompt);
    localStorage.setItem(LS_MODEL, next.model);
    localStorage.setItem(LS_SYSTEM, next.systemPrompt);
    setSettingsOpen(false);
  }

  return (
    <div className="flex h-full w-full text-neutral-100">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={() => newConversation()}
        onDelete={deleteConversation}
        onClearAll={clearAll}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ChatView
        conversation={active}
        model={model}
        sending={sending}
        error={error}
        onSend={handleSend}
      />
      {settingsOpen && (
        <SettingsModal
          model={model}
          systemPrompt={systemPrompt}
          onSave={saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
