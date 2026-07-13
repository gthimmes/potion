"use client";

import { useStore } from "@/store/useStore";
import type { Block as BlockT } from "@/lib/types";
import DatabaseView from "./database/DatabaseView";

export default function InlineDatabase({
  block,
}: {
  pageId: string;
  block: BlockT;
}) {
  const dbPage = useStore((s) => s.pages[block.content]);
  const setTitle = useStore((s) => s.setTitle);
  const setCurrentPage = useStore((s) => s.setCurrentPage);

  if (!dbPage || !dbPage.database) {
    return (
      <div className="my-2 rounded-md border border-app p-3 text-sm text-soft">
        🗂 Database removed
      </div>
    );
  }

  return (
    <div className="my-2 rounded-md border border-app p-2">
      <div className="mb-1 flex items-center gap-2 px-1">
        <span className="text-lg leading-none">{dbPage.icon}</span>
        <input
          value={dbPage.title}
          onChange={(e) => setTitle(dbPage.id, e.target.value)}
          placeholder="Untitled"
          className="flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-soft placeholder:opacity-50"
        />
        <button
          onClick={() => setCurrentPage(dbPage.id)}
          title="Open as full page"
          className="hover-app rounded px-1.5 py-0.5 text-sm text-soft"
        >
          ↗
        </button>
      </div>
      <DatabaseView pageId={dbPage.id} />
    </div>
  );
}
