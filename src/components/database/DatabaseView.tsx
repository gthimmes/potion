"use client";

import clsx from "clsx";
import { useStore } from "@/store/useStore";
import TableView from "./TableView";
import BoardView from "./BoardView";
import FilterSortBar from "./FilterSortBar";

export default function DatabaseView({ pageId }: { pageId: string }) {
  const page = useStore((s) => s.pages[pageId]);
  const setActiveView = useStore((s) => s.setActiveView);
  const db = page?.database;
  if (!db) return null;

  const active = db.views.find((v) => v.id === db.activeViewId) ?? db.views[0];

  return (
    <div>
      {/* view tabs */}
      <div className="mb-2 flex items-center gap-1 border-b border-app">
        {db.views.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(pageId, v.id)}
            className={clsx(
              "-mb-px border-b-2 px-3 py-1.5 text-sm",
              v.id === active.id
                ? "border-current font-medium"
                : "border-transparent text-soft"
            )}
          >
            {v.type === "board" ? "🗂 " : "▦ "}
            {v.name}
          </button>
        ))}
      </div>

      <FilterSortBar pageId={pageId} view={active} columns={db.columns} />

      {active.type === "table" ? (
        <TableView pageId={pageId} view={active} />
      ) : (
        <BoardView pageId={pageId} view={active} />
      )}
    </div>
  );
}
