"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import clsx from "clsx";
import { useStore } from "@/store/useStore";
import type { DbColumn, DbView, Filter, FilterOp, Sort } from "@/lib/types";
import { OPS_FOR_TYPE, OP_LABELS, VALUELESS_OPS } from "@/lib/dbQuery";

function FilterValueInput({
  column,
  filter,
  onChange,
}: {
  column: DbColumn | undefined;
  filter: Filter;
  onChange: (value: string) => void;
}) {
  if (VALUELESS_OPS.includes(filter.op)) return null;
  if (column?.type === "select") {
    return (
      <select
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-app bg-app px-1 py-0.5 text-sm"
      >
        <option value="">Select…</option>
        {(column.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={column?.type === "number" ? "number" : column?.type === "date" ? "date" : "text"}
      value={filter.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      className="w-28 rounded border border-app bg-app px-1.5 py-0.5 text-sm"
    />
  );
}

export default function FilterSortBar({
  pageId,
  view,
  columns,
}: {
  pageId: string;
  view: DbView;
  columns: DbColumn[];
}) {
  const setViewFilters = useStore((s) => s.setViewFilters);
  const setViewSorts = useStore((s) => s.setViewSorts);
  const [open, setOpen] = useState<"filter" | "sort" | null>(null);

  const filters = view.filters ?? [];
  const sorts = view.sorts ?? [];
  const colName = (id: string) => columns.find((c) => c.id === id)?.name ?? "?";

  // ---- filters ----
  const addFilter = () => {
    const col = columns[0];
    const op = OPS_FOR_TYPE[col.type][0];
    setViewFilters(pageId, view.id, [
      ...filters,
      { id: nanoid(), columnId: col.id, op, value: "" },
    ]);
  };
  const updateFilter = (id: string, patch: Partial<Filter>) => {
    setViewFilters(
      pageId,
      view.id,
      filters.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };
  const removeFilter = (id: string) =>
    setViewFilters(pageId, view.id, filters.filter((f) => f.id !== id));

  // ---- sorts ----
  const addSort = () => {
    setViewSorts(pageId, view.id, [
      ...sorts,
      { id: nanoid(), columnId: columns[0].id, dir: "asc" },
    ]);
  };
  const updateSort = (id: string, patch: Partial<Sort>) =>
    setViewSorts(
      pageId,
      view.id,
      sorts.map((so) => (so.id === id ? { ...so, ...patch } : so))
    );
  const removeSort = (id: string) =>
    setViewSorts(pageId, view.id, sorts.filter((so) => so.id !== id));

  const pill =
    "flex items-center gap-1 rounded-md px-2 py-1 text-sm hover-app";

  return (
    <div className="relative mb-2 flex items-center gap-2">
      <button
        onClick={() => setOpen(open === "filter" ? null : "filter")}
        className={clsx(pill, filters.length && "text-blue-500")}
      >
        🔽 Filter{filters.length ? ` (${filters.length})` : ""}
      </button>
      <button
        onClick={() => setOpen(open === "sort" ? null : "sort")}
        className={clsx(pill, sorts.length && "text-blue-500")}
      >
        ↕ Sort{sorts.length ? ` (${sorts.length})` : ""}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} />
          <div className="absolute left-0 top-9 z-50 w-[26rem] rounded-lg border border-app bg-app p-2 shadow-xl">
            {open === "filter" ? (
              <div className="space-y-2">
                {filters.length === 0 && (
                  <div className="px-1 py-1 text-sm text-soft">No filters yet</div>
                )}
                {filters.map((f) => {
                  const col = columns.find((c) => c.id === f.columnId);
                  return (
                    <div key={f.id} className="flex flex-wrap items-center gap-1">
                      <select
                        value={f.columnId}
                        onChange={(e) => {
                          const nc = columns.find((c) => c.id === e.target.value)!;
                          updateFilter(f.id, {
                            columnId: nc.id,
                            op: OPS_FOR_TYPE[nc.type][0],
                            value: "",
                          });
                        }}
                        className="rounded border border-app bg-app px-1 py-0.5 text-sm"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={f.op}
                        onChange={(e) =>
                          updateFilter(f.id, { op: e.target.value as FilterOp })
                        }
                        className="rounded border border-app bg-app px-1 py-0.5 text-sm"
                      >
                        {(col ? OPS_FOR_TYPE[col.type] : []).map((op) => (
                          <option key={op} value={op}>
                            {OP_LABELS[op]}
                          </option>
                        ))}
                      </select>
                      <FilterValueInput
                        column={col}
                        filter={f}
                        onChange={(value) => updateFilter(f.id, { value })}
                      />
                      <button
                        onClick={() => removeFilter(f.id)}
                        className="hover-app ml-auto rounded px-1 text-soft"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={addFilter}
                  className="hover-app w-full rounded px-1 py-1 text-left text-sm text-soft"
                >
                  ＋ Add filter
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sorts.length === 0 && (
                  <div className="px-1 py-1 text-sm text-soft">No sorts yet</div>
                )}
                {sorts.map((so) => (
                  <div key={so.id} className="flex items-center gap-1">
                    <select
                      value={so.columnId}
                      onChange={(e) =>
                        updateSort(so.id, { columnId: e.target.value })
                      }
                      className="rounded border border-app bg-app px-1 py-0.5 text-sm"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={so.dir}
                      onChange={(e) =>
                        updateSort(so.id, { dir: e.target.value as "asc" | "desc" })
                      }
                      className="rounded border border-app bg-app px-1 py-0.5 text-sm"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    <span className="text-xs text-soft">{colName(so.columnId)}</span>
                    <button
                      onClick={() => removeSort(so.id)}
                      className="hover-app ml-auto rounded px-1 text-soft"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSort}
                  className="hover-app w-full rounded px-1 py-1 text-left text-sm text-soft"
                >
                  ＋ Add sort
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
