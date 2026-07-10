"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useStore } from "@/store/useStore";
import { stripHtml } from "@/lib/richtext";

export default function QuickFind({ onClose }: { onClose: () => void }) {
  const pages = useStore((s) => s.pages);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const createPage = useStore((s) => s.createPage);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const results = useMemo(() => {
    const all = Object.values(pages);
    const query = q.trim().toLowerCase();
    const matched = query
      ? all.filter((p) => {
          const inTitle = (p.title || "Untitled").toLowerCase().includes(query);
          const inBody = p.blocks.some((b) =>
            stripHtml(b.content).toLowerCase().includes(query)
          );
          return inTitle || inBody;
        })
      : all.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
    return matched.slice(0, 12);
  }, [pages, q]);

  const open = (id: string) => {
    setCurrentPage(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 pt-32"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-app bg-app shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIdx(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIdx((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (results[idx]) open(results[idx].id);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          placeholder="Search pages..."
          className="w-full border-b border-app bg-transparent px-4 py-3 text-base outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-1">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-soft">
              No pages found
            </div>
          )}
          {results.map((p, i) => (
            <button
              key={p.id}
              onMouseEnter={() => setIdx(i)}
              onClick={() => open(p.id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left",
                i === idx && "bg-black/5 dark:bg-white/10"
              )}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="flex-1 truncate">{p.title || "Untitled"}</span>
              {p.isDatabase && (
                <span className="text-xs text-soft">Database</span>
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-app px-4 py-2 text-xs text-soft">
          <button
            onClick={() => {
              const id = createPage(null, false);
              open(id);
            }}
            className="hover-app rounded px-1"
          >
            ＋ Create new page
          </button>
        </div>
      </div>
    </div>
  );
}
