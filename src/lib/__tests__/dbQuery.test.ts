import { describe, expect, it } from "vitest";
import { OPS_FOR_TYPE, VALUELESS_OPS, queryRows } from "@/lib/dbQuery";
import type { DbColumn, DbRow, DbView, Filter, Sort } from "@/lib/types";

const name: DbColumn = { id: "name", name: "Name", type: "text" };
const num: DbColumn = { id: "num", name: "Count", type: "number" };
const status: DbColumn = {
  id: "status",
  name: "Status",
  type: "select",
  options: ["Todo", "Done"],
};
const done: DbColumn = { id: "done", name: "Done", type: "checkbox" };
const due: DbColumn = { id: "due", name: "Due", type: "date" };
const columns = [name, num, status, done, due];

const rows: DbRow[] = [
  { id: "1", cells: { name: "Alpha", num: "3", status: "Todo", done: "false", due: "2026-01-10" } },
  { id: "2", cells: { name: "Beta", num: "1", status: "Done", done: "true", due: "2026-03-01" } },
  { id: "3", cells: { name: "Gamma", num: "2", status: "", done: "false", due: "" } },
];

function view(filters: Filter[] = [], sorts: Sort[] = []): DbView {
  return { id: "v", name: "V", type: "table", filters, sorts };
}

const ids = (rs: DbRow[]) => rs.map((r) => r.id);

describe("filters", () => {
  it("text contains / not_contains", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "name", op: "contains", value: "a" }])))).toEqual(["1", "2", "3"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "name", op: "contains", value: "lph" }])))).toEqual(["1"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "name", op: "not_contains", value: "a" }])))).toEqual([]);
  });

  it("text is / is_not", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "name", op: "is", value: "Beta" }])))).toEqual(["2"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "name", op: "is_not", value: "Beta" }])))).toEqual(["1", "3"]);
  });

  it("is_empty / is_not_empty", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "status", op: "is_empty", value: "" }])))).toEqual(["3"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "status", op: "is_not_empty", value: "" }])))).toEqual(["1", "2"]);
  });

  it("number comparisons", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "num", op: "gt", value: "1" }])))).toEqual(["1", "3"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "num", op: "lte", value: "2" }])))).toEqual(["2", "3"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "num", op: "eq", value: "3" }])))).toEqual(["1"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "num", op: "neq", value: "3" }])))).toEqual(["2", "3"]);
  });

  it("select is / is_not", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "status", op: "is", value: "Done" }])))).toEqual(["2"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "status", op: "is_not", value: "Done" }])))).toEqual(["1", "3"]);
  });

  it("checkbox checked / unchecked", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "done", op: "checked", value: "" }])))).toEqual(["2"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "done", op: "unchecked", value: "" }])))).toEqual(["1", "3"]);
  });

  it("date before / after (ignores empty)", () => {
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "due", op: "before", value: "2026-02-01" }])))).toEqual(["1"]);
    expect(ids(queryRows(rows, columns, view([{ id: "f", columnId: "due", op: "after", value: "2026-02-01" }])))).toEqual(["2"]);
  });

  it("combines multiple filters with AND", () => {
    const v = view([
      { id: "f1", columnId: "num", op: "gte", value: "2" },
      { id: "f2", columnId: "done", op: "unchecked", value: "" },
    ]);
    expect(ids(queryRows(rows, columns, v))).toEqual(["1", "3"]);
  });
});

describe("sorts", () => {
  it("sorts text ascending and descending", () => {
    expect(ids(queryRows(rows, columns, view([], [{ id: "s", columnId: "name", dir: "asc" }])))).toEqual(["1", "2", "3"]);
    expect(ids(queryRows(rows, columns, view([], [{ id: "s", columnId: "name", dir: "desc" }])))).toEqual(["3", "2", "1"]);
  });

  it("sorts numbers numerically, not lexically", () => {
    expect(ids(queryRows(rows, columns, view([], [{ id: "s", columnId: "num", dir: "asc" }])))).toEqual(["2", "3", "1"]);
  });

  it("applies multi-column sort in order", () => {
    const extra: DbRow[] = [
      ...rows,
      { id: "4", cells: { status: "Done", num: "5", name: "Delta" } },
    ];
    const v = view([], [
      { id: "s1", columnId: "status", dir: "asc" },
      { id: "s2", columnId: "num", dir: "desc" },
    ]);
    // group by status asc ("" < "Done" < "Todo"); within Done, num desc -> 4 before 2
    expect(ids(queryRows(extra, columns, v))).toEqual(["3", "4", "2", "1"]);
  });

  it("does not mutate the input array", () => {
    const input = [...rows];
    queryRows(input, columns, view([], [{ id: "s", columnId: "name", dir: "desc" }]));
    expect(ids(input)).toEqual(["1", "2", "3"]);
  });
});

describe("metadata", () => {
  it("exposes operators for every column type", () => {
    expect(OPS_FOR_TYPE.text).toContain("contains");
    expect(OPS_FOR_TYPE.number).toContain("gt");
    expect(OPS_FOR_TYPE.select).toContain("is");
    expect(OPS_FOR_TYPE.date).toContain("before");
    expect(OPS_FOR_TYPE.checkbox).toEqual(["checked", "unchecked"]);
  });

  it("marks valueless operators", () => {
    expect(VALUELESS_OPS).toContain("is_empty");
    expect(VALUELESS_OPS).toContain("checked");
    expect(VALUELESS_OPS).not.toContain("contains");
  });
});
