import type { Message } from "../types";

export interface ChatRequest {
  apiKey: string;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  signal?: AbortSignal;
}

export async function sendChat({
  apiKey,
  model,
  messages,
  systemPrompt,
  signal,
}: ChatRequest): Promise<string> {
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
    }),
    signal,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message ?? JSON.stringify(err);
    } catch {
      detail = await res.text();
    }
    throw new Error(`OpenAI ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response shape from OpenAI");
  }
  return content;
}
