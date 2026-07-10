"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { Page } from "@/lib/types";

export default function MentionMenu({
  items,
  activeIndex,
  onHover,
  onSelect,
}: {
  items: Page[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (page: Page) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current
      ?.querySelector(`[data-idx="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-6 z-50 max-h-64 w-72 overflow-y-auto rounded-lg border border-app bg-app p-1 shadow-xl"
    >
      <div className="px-2 py-1 text-xs font-medium uppercase text-soft">
        Link to page
      </div>
      {items.length === 0 && (
        <div className="px-2 py-2 text-sm text-soft">No pages found</div>
      )}
      {items.map((page, i) => (
        <button
          key={page.id}
          data-idx={i}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(page);
          }}
          className={clsx(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
            i === activeIndex && "bg-black/5 dark:bg-white/10"
          )}
        >
          <span className="text-base">{page.icon}</span>
          <span className="truncate text-sm">{page.title || "Untitled"}</span>
        </button>
      ))}
    </div>
  );
}
