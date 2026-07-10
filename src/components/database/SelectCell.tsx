"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { selectColor } from "@/lib/constants";
import type { DbColumn } from "@/lib/types";

export function Tag({ value }: { value: string }) {
  if (!value) return null;
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs text-[#37352f]"
      style={{ background: selectColor(value) }}
    >
      {value}
    </span>
  );
}

export default function SelectCell({
  pageId,
  rowId,
  column,
  value,
}: {
  pageId: string;
  rowId: string;
  column: DbColumn;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const updateCell = useStore((s) => s.updateCell);
  const addSelectOption = useStore((s) => s.addSelectOption);

  const options = column.options ?? [];
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );
  const canCreate = query.trim() && !options.includes(query.trim());

  const choose = (opt: string) => {
    updateCell(pageId, rowId, column.id, opt);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-6 w-full items-center px-1 text-left"
      >
        {value ? <Tag value={value} /> : <span className="text-soft">Empty</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-7 z-50 w-52 rounded-lg border border-app bg-app p-2 shadow-xl">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or create..."
              className="mb-2 w-full rounded border border-app bg-transparent px-2 py-1 text-sm outline-none"
            />
            <div className="max-h-48 overflow-y-auto">
              {value && (
                <button
                  onClick={() => choose("")}
                  className="hover-app mb-1 block w-full rounded px-2 py-1 text-left text-xs text-soft"
                >
                  Clear
                </button>
              )}
              {filtered.map((o) => (
                <button
                  key={o}
                  onClick={() => choose(o)}
                  className="hover-app block w-full rounded px-2 py-1 text-left"
                >
                  <Tag value={o} />
                </button>
              ))}
              {canCreate && (
                <button
                  onClick={() => {
                    addSelectOption(pageId, column.id, query.trim());
                    choose(query.trim());
                  }}
                  className="hover-app block w-full rounded px-2 py-1 text-left text-sm"
                >
                  Create <Tag value={query.trim()} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
