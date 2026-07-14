import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@/store/useStore";
import { resetStore, store } from "@/test/resetStore";

beforeEach(() => resetStore());

describe("page ops", () => {
  it("creates a root page with one empty text block and selects it", () => {
    const id = store().createPage(null, false);
    const p = store().pages[id];
    expect(p).toBeDefined();
    expect(p.isDatabase).toBe(false);
    expect(p.parentId).toBeNull();
    expect(p.blocks).toHaveLength(1);
    expect(p.blocks[0].type).toBe("text");
    expect(store().rootOrder).toContain(id);
    expect(store().currentPageId).toBe(id);
  });

  it("creates a database page with default columns, rows and views", () => {
    const id = store().createPage(null, true);
    const p = store().pages[id];
    expect(p.isDatabase).toBe(true);
    expect(p.database).toBeDefined();
    expect(p.database!.columns.length).toBeGreaterThanOrEqual(2);
    expect(p.database!.rows.length).toBe(3);
    expect(p.database!.views.map((v) => v.type)).toEqual(["table", "board"]);
  });

  it("createChildPage links to parent without navigating and expands parent", () => {
    const parent = store().createPage(null, false);
    store().setCurrentPage(parent);
    const child = store().createChildPage(parent);
    expect(store().pages[parent].children).toContain(child);
    expect(store().pages[child].parentId).toBe(parent);
    expect(store().currentPageId).toBe(parent); // did not navigate
    expect(store().expanded[parent]).toBe(true);
  });

  it("createChildDatabase creates a database child", () => {
    const parent = store().createPage(null, false);
    const child = store().createChildDatabase(parent);
    expect(store().pages[child].isDatabase).toBe(true);
    expect(store().pages[child].database).toBeDefined();
    expect(store().pages[parent].children).toContain(child);
  });

  it("deletePage removes the page, its descendants, and detaches from parent", () => {
    const parent = store().createPage(null, false);
    const child = store().createChildPage(parent);
    const grandchild = store().createChildPage(child);
    store().deletePage(child);
    expect(store().pages[child]).toBeUndefined();
    expect(store().pages[grandchild]).toBeUndefined();
    expect(store().pages[parent].children).not.toContain(child);
    expect(store().pages[parent]).toBeDefined();
  });

  it("deletePage moves currentPage to a remaining root when the current page is deleted", () => {
    const a = store().createPage(null, false);
    const b = store().createPage(null, false);
    store().setCurrentPage(b);
    store().deletePage(b);
    expect(store().currentPageId).toBe(a);
  });

  it("setTitle / setIcon / setCover mutate the page", () => {
    const id = store().createPage(null, false);
    store().setTitle(id, "Roadmap");
    store().setIcon(id, "🚀");
    store().setCover(id, "ocean");
    const p = store().pages[id];
    expect(p.title).toBe("Roadmap");
    expect(p.icon).toBe("🚀");
    expect(p.cover).toBe("ocean");
  });
});

describe("movePage", () => {
  it("reorders root pages", () => {
    const a = store().createPage(null, false);
    const b = store().createPage(null, false);
    expect(store().rootOrder).toEqual([a, b]);
    store().movePage(b, null, 0);
    expect(store().rootOrder).toEqual([b, a]);
  });

  it("moves a page under a new parent", () => {
    const a = store().createPage(null, false);
    const b = store().createPage(null, false);
    store().movePage(b, a, 0);
    expect(store().pages[a].children).toEqual([b]);
    expect(store().pages[b].parentId).toBe(a);
    expect(store().rootOrder).not.toContain(b);
  });

  it("refuses to move a page into its own descendant", () => {
    const parent = store().createPage(null, false);
    const child = store().createChildPage(parent);
    store().movePage(parent, child, 0);
    // unchanged: parent still at root, child still under parent
    expect(store().pages[parent].parentId).toBeNull();
    expect(store().pages[child].parentId).toBe(parent);
  });
});

describe("block ops", () => {
  let pageId: string;
  beforeEach(() => {
    pageId = store().createPage(null, false);
  });

  it("inserts a block after another", () => {
    const first = store().pages[pageId].blocks[0].id;
    const newId = store().insertBlock(pageId, first, "h1");
    const blocks = store().pages[pageId].blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[1].id).toBe(newId);
    expect(blocks[1].type).toBe("h1");
  });

  it("updates a block's content", () => {
    const first = store().pages[pageId].blocks[0].id;
    store().updateBlock(pageId, first, "Hello <b>world</b>");
    expect(store().pages[pageId].blocks[0].content).toBe("Hello <b>world</b>");
  });

  it("sets a block's type and toggles a todo", () => {
    const first = store().pages[pageId].blocks[0].id;
    store().setBlockType(pageId, first, "todo");
    expect(store().pages[pageId].blocks[0].type).toBe("todo");
    store().toggleTodo(pageId, first);
    expect(store().pages[pageId].blocks[0].checked).toBe(true);
    store().toggleTodo(pageId, first);
    expect(store().pages[pageId].blocks[0].checked).toBe(false);
  });

  it("won't delete the last remaining block", () => {
    const first = store().pages[pageId].blocks[0].id;
    store().deleteBlock(pageId, first);
    expect(store().pages[pageId].blocks).toHaveLength(1);
  });

  it("deletes a block when more than one exists", () => {
    const first = store().pages[pageId].blocks[0].id;
    const second = store().insertBlock(pageId, first, "text");
    store().deleteBlock(pageId, second);
    expect(store().pages[pageId].blocks.map((b) => b.id)).toEqual([first]);
  });

  it("moves a block by index", () => {
    const first = store().pages[pageId].blocks[0].id;
    const second = store().insertBlock(pageId, first, "h2");
    store().moveBlock(pageId, 1, 0);
    expect(store().pages[pageId].blocks[0].id).toBe(second);
    expect(store().pages[pageId].blocks[1].id).toBe(first);
  });
});

describe("database ops", () => {
  let dbId: string;
  const cols = () => store().pages[dbId].database!.columns;
  const rows = () => store().pages[dbId].database!.rows;
  const views = () => store().pages[dbId].database!.views;

  beforeEach(() => {
    dbId = store().createPage(null, true);
  });

  it("adds and deletes rows", () => {
    const before = rows().length;
    store().addRow(dbId);
    expect(rows()).toHaveLength(before + 1);
    const rid = rows()[rows().length - 1].id;
    store().deleteRow(dbId, rid);
    expect(rows().map((r) => r.id)).not.toContain(rid);
  });

  it("updates a cell value", () => {
    const rid = rows()[0].id;
    const cid = cols()[0].id;
    store().updateCell(dbId, rid, cid, "Renamed");
    expect(store().pages[dbId].database!.rows[0].cells[cid]).toBe("Renamed");
  });

  it("adds a column of a given type", () => {
    store().addColumn(dbId, "number");
    const last = cols()[cols().length - 1];
    expect(last.type).toBe("number");
  });

  it("renames a column", () => {
    const cid = cols()[0].id;
    store().renameColumn(dbId, cid, "Title");
    expect(cols().find((c) => c.id === cid)!.name).toBe("Title");
  });

  it("deletes a column and prunes cells, groupBy, filters and sorts", () => {
    const statusCol = cols()[1];
    const boardView = views().find((v) => v.type === "board")!;
    // attach a filter and sort on the status column
    store().setViewFilters(dbId, boardView.id, [
      { id: "f1", columnId: statusCol.id, op: "is", value: "Done" },
    ]);
    store().setViewSorts(dbId, boardView.id, [
      { id: "s1", columnId: statusCol.id, dir: "asc" },
    ]);
    store().deleteColumn(dbId, statusCol.id);

    expect(cols().find((c) => c.id === statusCol.id)).toBeUndefined();
    expect(rows().every((r) => !(statusCol.id in r.cells))).toBe(true);
    const bv = views().find((v) => v.id === boardView.id)!;
    expect(bv.groupBy).toBeUndefined();
    expect(bv.filters).toHaveLength(0);
    expect(bv.sorts).toHaveLength(0);
  });

  it("won't delete the last remaining column", () => {
    // delete down to one, then attempt again
    while (cols().length > 1) store().deleteColumn(dbId, cols()[cols().length - 1].id);
    const remaining = cols()[0].id;
    store().deleteColumn(dbId, remaining);
    expect(cols()).toHaveLength(1);
  });

  it("adds a select option without duplicating", () => {
    const selectCol = cols().find((c) => c.type === "select")!;
    store().addSelectOption(dbId, selectCol.id, "Blocked");
    store().addSelectOption(dbId, selectCol.id, "Blocked");
    const opts = cols().find((c) => c.id === selectCol.id)!.options!;
    expect(opts.filter((o) => o === "Blocked")).toHaveLength(1);
  });

  it("sets the active view", () => {
    const boardView = views().find((v) => v.type === "board")!;
    store().setActiveView(dbId, boardView.id);
    expect(store().pages[dbId].database!.activeViewId).toBe(boardView.id);
  });

  it("sets filters and sorts for a view", () => {
    const v = views()[0];
    const cid = cols()[0].id;
    store().setViewFilters(dbId, v.id, [
      { id: "f1", columnId: cid, op: "contains", value: "Task" },
    ]);
    store().setViewSorts(dbId, v.id, [{ id: "s1", columnId: cid, dir: "desc" }]);
    const view = store().pages[dbId].database!.views.find((x) => x.id === v.id)!;
    expect(view.filters).toHaveLength(1);
    expect(view.sorts).toHaveLength(1);
  });
});

describe("ui state", () => {
  it("toggles theme and expanded", () => {
    expect(useStore.getState().theme).toBe("light");
    store().toggleTheme();
    expect(useStore.getState().theme).toBe("dark");
    const id = store().createPage(null, false);
    const before = !!store().expanded[id];
    store().toggleExpanded(id);
    expect(!!store().expanded[id]).toBe(!before);
  });
});
