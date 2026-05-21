import type { Conversation } from "../types";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  onOpenSettings,
}: Props) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-neutral-950 text-neutral-200">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm font-medium hover:bg-white/5"
        >
          <span className="text-lg leading-none">+</span> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 pb-1 pt-2 text-xs uppercase tracking-wide text-neutral-500">
          History
        </div>
        {conversations.length === 0 && (
          <div className="px-2 py-2 text-xs text-neutral-500">
            No conversations yet
          </div>
        )}
        <ul className="space-y-1">
          {conversations.map((c) => (
            <li key={c.id}>
              <div
                className={`group flex items-center justify-between rounded-md px-2 py-2 text-sm cursor-pointer ${
                  c.id === activeId
                    ? "bg-white/10 text-white"
                    : "hover:bg-white/5 text-neutral-300"
                }`}
                onClick={() => onSelect(c.id)}
              >
                <span className="truncate">{c.title || "Untitled"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="ml-2 hidden text-neutral-500 hover:text-red-400 group-hover:inline"
                  aria-label="Delete conversation"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1 border-t border-white/10 p-2 text-sm">
        <button
          onClick={onClearAll}
          className="w-full rounded-md px-3 py-2 text-left text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
        >
          Clear history
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full rounded-md px-3 py-2 text-left text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
        >
          Settings
        </button>
        <div className="px-3 pt-1 text-[10px] text-neutral-600">
          History is kept in memory only and clears on refresh.
        </div>
      </div>
    </aside>
  );
}
