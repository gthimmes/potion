"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { DbView } from "@/lib/types";
import { Tag } from "./SelectCell";
import Cell from "./Cell";

export default function BoardView({
  pageId,
  view,
}: {
  pageId: string;
  view: DbView;
}) {
  const page = useStore((s) => s.pages[pageId]);
  const updateCell = useStore((s) => s.updateCell);
  const addRow = useStore((s) => s.addRow);
  const [dragRow, setDragRow] = useState<string | null>(null);

  const db = page?.database;
  if (!db) return null;

  const groupCol =
    db.columns.find((c) => c.id === view.groupBy) ??
    db.columns.find((c) => c.type === "select");

  if (!groupCol) {
    return (
      <div className="p-4 text-sm text-soft">
        Add a Select property to group this board.
      </div>
    );
  }

  const nameCol = db.columns[0];
  const groups = ["", ...(groupCol.options ?? [])];

  const drop = (groupValue: string) => {
    if (dragRow) updateCell(pageId, dragRow, groupCol.id, groupValue);
    setDragRow(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {groups.map((g) => {
        const rows = db.rows.filter(
          (r) => (r.cells[groupCol.id] ?? "") === g
        );
        return (
          <div
            key={g || "__none"}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(g)}
            className="w-64 shrink-0 rounded-lg bg-black/[0.03] p-2 dark:bg-white/[0.03]"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span>{g ? <Tag value={g} /> : <span className="text-sm text-soft">No {groupCol.name}</span>}</span>
              <span className="text-xs text-soft">{rows.length}</span>
            </div>
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.id}
                  draggable
                  onDragStart={() => setDragRow(row.id)}
                  className="cursor-grab rounded-md border border-app bg-app p-2 shadow-sm active:cursor-grabbing"
                >
                  <div className="mb-1 text-sm font-medium">
                    {row.cells[nameCol.id] || "Untitled"}
                  </div>
                  {db.columns
                    .filter((c) => c.id !== nameCol.id && c.id !== groupCol.id)
                    .map((c) => (
                      <div key={c.id} className="text-xs text-soft">
                        <Cell
                          pageId={pageId}
                          rowId={row.id}
                          column={c}
                          value={row.cells[c.id] ?? ""}
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                addRow(pageId);
                // set the new row's group after creation
                const st = useStore.getState().pages[pageId];
                const newRow = st?.database?.rows.at(-1);
                if (newRow && g) updateCell(pageId, newRow.id, groupCol.id, g);
              }}
              className="hover-app mt-2 w-full rounded px-2 py-1 text-left text-sm text-soft"
            >
              ＋ New
            </button>
          </div>
        );
      })}
    </div>
  );
}
