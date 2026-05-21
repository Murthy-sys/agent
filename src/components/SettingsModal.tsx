import { useState } from "react";

interface Props {
  apiKey: string;
  model: string;
  systemPrompt: string;
  onSave: (next: { apiKey: string; model: string; systemPrompt: string }) => void;
  onClose: () => void;
}

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

export default function SettingsModal({
  apiKey,
  model,
  systemPrompt,
  onSave,
  onClose,
}: Props) {
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftModel, setDraftModel] = useState(model);
  const [draftSystem, setDraftSystem] = useState(systemPrompt);
  const [reveal, setReveal] = useState(false);

  function handleSave() {
    onSave({
      apiKey: draftKey.trim(),
      model: draftModel,
      systemPrompt: draftSystem,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-5 text-neutral-200 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-neutral-400 hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <label className="block text-xs font-medium text-neutral-400">
          OpenAI API key
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type={reveal ? "text" : "password"}
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setReveal((v) => !v)}
            className="rounded-md border border-white/10 px-2 text-xs text-neutral-300 hover:bg-white/5"
          >
            {reveal ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Stored locally in your browser (localStorage). Calls go directly to
          api.openai.com from your browser.
        </p>

        <label className="mt-4 block text-xs font-medium text-neutral-400">
          Model
        </label>
        <select
          value={draftModel}
          onChange={(e) => setDraftModel(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs font-medium text-neutral-400">
          System prompt (optional)
        </label>
        <textarea
          value={draftSystem}
          onChange={(e) => setDraftSystem(e.target.value)}
          rows={3}
          placeholder="You are a helpful assistant."
          className="mt-1 w-full resize-y rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
