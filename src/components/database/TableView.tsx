"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { ColumnType, DbColumn } from "@/lib/types";
import Cell from "./Cell";

const TYPE_ICON: Record<ColumnType, string> = {
  text: "𝐓",
  number: "#",
  select: "▾",
  date: "📅",
  checkbox: "☑",
};

function ColumnHeader({
  pageId,
  column,
}: {
  pageId: string;
  column: DbColumn;
}) {
  const renameColumn = useStore((s) => s.renameColumn);
  const deleteColumn = useStore((s) => s.deleteColumn);
  const [menu, setMenu] = useState(false);

  return (
    <div className="relative flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-soft">
      <span className="text-xs opacity-70">{TYPE_ICON[column.type]}</span>
      <input
        value={column.name}
        onChange={(e) => renameColumn(pageId, column.id, e.target.value)}
        className="w-full bg-transparent outline-none"
      />
      <button
        onClick={() => setMenu((v) => !v)}
        className="hover-app rounded px-1 opacity-0 group-hover/head:opacity-100"
      >
        ⋯
      </button>
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
          <div className="absolute right-0 top-8 z-50 w-40 rounded-lg border border-app bg-app p-1 shadow-xl">
            <button
              onClick={() => {
                deleteColumn(pageId, column.id);
                setMenu(false);
              }}
              className="hover-app block w-full rounded px-2 py-1 text-left text-sm text-red-500"
            >
              Delete property
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AddColumnButton({ pageId }: { pageId: string }) {
  const addColumn = useStore((s) => s.addColumn);
  const [menu, setMenu] = useState(false);
  const types: ColumnType[] = ["text", "number", "select", "date", "checkbox"];

  return (
    <div className="relative">
      <button
        onClick={() => setMenu((v) => !v)}
        className="hover-app h-full px-3 py-1.5 text-sm text-soft"
      >
        ＋
      </button>
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
          <div className="absolute right-0 top-8 z-50 w-44 rounded-lg border border-app bg-app p-1 shadow-xl">
            <div className="px-2 py-1 text-xs uppercase text-soft">New property</div>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => {
                  addColumn(pageId, t);
                  setMenu(false);
                }}
                className="hover-app flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm capitalize"
              >
                <span className="w-4 text-center">{TYPE_ICON[t]}</span> {t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TableView({ pageId }: { pageId: string }) {
  const page = useStore((s) => s.pages[pageId]);
  const addRow = useStore((s) => s.addRow);
  const deleteRow = useStore((s) => s.deleteRow);
  const db = page?.database;
  if (!db) return null;

  const gridCols = `minmax(0,2fr) ${db.columns
    .slice(1)
    .map(() => "minmax(0,1fr)")
    .join(" ")} 40px`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* header */}
        <div
          className="group/head grid border-b border-app"
          style={{ gridTemplateColumns: gridCols }}
        >
          {db.columns.map((c) => (
            <ColumnHeader key={c.id} pageId={pageId} column={c} />
          ))}
          <div className="flex items-center justify-center border-l border-app">
            <AddColumnButton pageId={pageId} />
          </div>
        </div>

        {/* rows */}
        {db.rows.map((row) => (
          <div
            key={row.id}
            className="group grid border-b border-app hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            style={{ gridTemplateColumns: gridCols }}
          >
            {db.columns.map((c) => (
              <div key={c.id} className="flex items-center py-1 border-app">
                <Cell
                  pageId={pageId}
                  rowId={row.id}
                  column={c}
                  value={row.cells[c.id] ?? ""}
                />
              </div>
            ))}
            <div className="flex items-center justify-center">
              <button
                onClick={() => deleteRow(pageId, row.id)}
                className="hover-app rounded px-1 text-soft opacity-0 group-hover:opacity-100"
                title="Delete row"
              >
                🗑
              </button>
            </div>
          </div>
        ))}

        {/* add row */}
        <button
          onClick={() => addRow(pageId)}
          className="hover-app flex w-full items-center gap-2 px-2 py-2 text-sm text-soft"
        >
          ＋ New
        </button>
      </div>
    </div>
  );
}
