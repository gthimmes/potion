"use client";

import { useStore } from "@/store/useStore";
import type { Block as BlockT } from "@/lib/types";

export default function SubpageBlock({
  block,
}: {
  pageId: string;
  block: BlockT;
}) {
  const target = useStore((s) => s.pages[block.content]);
  const setCurrentPage = useStore((s) => s.setCurrentPage);

  if (!target) {
    return (
      <div className="my-0.5 flex items-center gap-2 rounded px-1 py-1 text-soft">
        <span>📄</span>
        <span className="italic">Untitled (page removed)</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setCurrentPage(target.id)}
      className="hover-app my-0.5 flex w-full items-center gap-2 rounded px-1 py-1 text-left"
    >
      <span className="text-lg leading-none">{target.icon}</span>
      <span className="border-b border-current/20 font-medium">
        {target.title || "Untitled"}
      </span>
    </button>
  );
}
