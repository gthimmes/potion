import type {
  ColumnType,
  DbColumn,
  DbRow,
  DbView,
  Filter,
  FilterOp,
} from "./types";

export const OP_LABELS: Record<FilterOp, string> = {
  contains: "contains",
  not_contains: "does not contain",
  is: "is",
  is_not: "is not",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  eq: "=",
  neq: "≠",
  gt: ">",
  lt: "<",
  gte: "≥",
  lte: "≤",
  checked: "is checked",
  unchecked: "is unchecked",
  before: "is before",
  after: "is after",
};

// Which operators apply to each column type.
export const OPS_FOR_TYPE: Record<ColumnType, FilterOp[]> = {
  text: ["contains", "not_contains", "is", "is_not", "is_empty", "is_not_empty"],
  number: ["eq", "neq", "gt", "lt", "gte", "lte", "is_empty", "is_not_empty"],
  select: ["is", "is_not", "is_empty", "is_not_empty"],
  date: ["is", "before", "after", "is_empty", "is_not_empty"],
  checkbox: ["checked", "unchecked"],
};

// Operators that don't need a value input.
export const VALUELESS_OPS: FilterOp[] = [
  "is_empty",
  "is_not_empty",
  "checked",
  "unchecked",
];

function matchesFilter(row: DbRow, filter: Filter): boolean {
  const raw = row.cells[filter.columnId] ?? "";
  const v = raw.toLowerCase();
  const target = filter.value.toLowerCase();
  switch (filter.op) {
    case "contains":
      return v.includes(target);
    case "not_contains":
      return !v.includes(target);
    case "is":
      return v === target;
    case "is_not":
      return v !== target;
    case "is_empty":
      return raw === "";
    case "is_not_empty":
      return raw !== "";
    case "eq":
      return Number(raw) === Number(filter.value);
    case "neq":
      return Number(raw) !== Number(filter.value);
    case "gt":
      return Number(raw) > Number(filter.value);
    case "lt":
      return Number(raw) < Number(filter.value);
    case "gte":
      return Number(raw) >= Number(filter.value);
    case "lte":
      return Number(raw) <= Number(filter.value);
    case "checked":
      return raw === "true";
    case "unchecked":
      return raw !== "true";
    case "before":
      return raw !== "" && raw < filter.value;
    case "after":
      return raw !== "" && raw > filter.value;
    default:
      return true;
  }
}

function compareRows(
  a: DbRow,
  b: DbRow,
  columns: DbColumn[],
  view: DbView
): number {
  for (const sort of view.sorts ?? []) {
    const col = columns.find((c) => c.id === sort.columnId);
    const av = a.cells[sort.columnId] ?? "";
    const bv = b.cells[sort.columnId] ?? "";
    let cmp: number;
    if (col?.type === "number") {
      const an = av === "" ? -Infinity : Number(av);
      const bn = bv === "" ? -Infinity : Number(bv);
      cmp = an - bn;
    } else {
      cmp = av.localeCompare(bv);
    }
    if (cmp !== 0) return sort.dir === "asc" ? cmp : -cmp;
  }
  return 0;
}

// Apply a view's filters then sorts to the given rows.
export function queryRows(
  rows: DbRow[],
  columns: DbColumn[],
  view: DbView
): DbRow[] {
  let out = rows;
  const filters = view.filters ?? [];
  if (filters.length) {
    out = out.filter((r) => filters.every((f) => matchesFilter(r, f)));
  }
  if ((view.sorts ?? []).length) {
    out = [...out].sort((a, b) => compareRows(a, b, columns, view));
  }
  return out;
}
