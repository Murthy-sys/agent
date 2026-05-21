import type { Message } from "../types";

export interface StreamChatRequest {
  apiKey: string;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  signal?: AbortSignal;
  onToken: (delta: string) => void;
}

export async function streamChat({
  apiKey,
  model,
  messages,
  systemPrompt,
  signal,
  onToken,
}: StreamChatRequest): Promise<void> {
  const payloadMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      temperature: 0.7,
      stream: true,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message ?? JSON.stringify(err);
    } catch {
      detail = await res.text();
    }
    throw new Error(`OpenAI ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || !line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const delta: string | undefined = parsed?.choices?.[0]?.delta?.content;
        if (delta) onToken(delta);
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}
