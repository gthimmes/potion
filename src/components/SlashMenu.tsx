"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { BlockCommand } from "@/lib/blockCommands";

export default function SlashMenu({
  items,
  activeIndex,
  onHover,
  onSelect,
}: {
  items: BlockCommand[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (item: BlockCommand) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (items.length === 0) {
    return (
      <div className="absolute left-0 top-6 z-50 w-72 rounded-lg border border-app bg-app p-3 text-sm text-soft shadow-xl">
        No matching blocks
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="absolute left-0 top-6 z-50 max-h-72 w-72 overflow-y-auto rounded-lg border border-app bg-app p-1 shadow-xl"
    >
      <div className="px-2 py-1 text-xs font-medium uppercase text-soft">Basic blocks</div>
      {items.map((item, i) => (
        <button
          key={item.type}
          data-idx={i}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
          className={clsx(
            "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left",
            i === activeIndex && "bg-black/5 dark:bg-white/10"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-app text-sm">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm">{item.label}</span>
            <span className="block truncate text-xs text-soft">{item.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
