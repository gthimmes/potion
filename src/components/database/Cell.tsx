"use client";

import { useStore } from "@/store/useStore";
import type { DbColumn } from "@/lib/types";
import SelectCell from "./SelectCell";

export default function Cell({
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
  const updateCell = useStore((s) => s.updateCell);

  if (column.type === "select") {
    return (
      <SelectCell pageId={pageId} rowId={rowId} column={column} value={value} />
    );
  }

  if (column.type === "checkbox") {
    return (
      <div className="flex items-center px-1">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) =>
            updateCell(pageId, rowId, column.id, e.target.checked ? "true" : "false")
          }
          className="h-4 w-4 cursor-pointer accent-blue-500"
        />
      </div>
    );
  }

  if (column.type === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => updateCell(pageId, rowId, column.id, e.target.value)}
        className="w-full bg-transparent px-1 text-sm outline-none"
      />
    );
  }

  // text / number
  return (
    <input
      type={column.type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => updateCell(pageId, rowId, column.id, e.target.value)}
      placeholder="Empty"
      className="w-full bg-transparent px-1 text-sm outline-none placeholder:text-soft placeholder:opacity-50"
    />
  );
}
