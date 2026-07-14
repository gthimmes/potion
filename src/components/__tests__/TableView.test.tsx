import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TableView from "@/components/database/TableView";
import { resetStore, store } from "@/test/resetStore";
import type { DbView } from "@/lib/types";

function setup() {
  const dbId = store().createPage(null, true);
  const db = store().pages[dbId].database!;
  const view = db.views.find((v) => v.type === "table") as DbView;
  return { dbId, view };
}

beforeEach(() => resetStore());

describe("TableView", () => {
  it("renders a row per database row", () => {
    const { dbId, view } = setup();
    render(<TableView pageId={dbId} view={view} />);
    expect(screen.getByDisplayValue("Task A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Task B")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Task C")).toBeInTheDocument();
  });

  it("adds a row via the New button", () => {
    const { dbId, view } = setup();
    render(<TableView pageId={dbId} view={view} />);
    const before = store().pages[dbId].database!.rows.length;
    fireEvent.click(screen.getByText("＋ New"));
    expect(store().pages[dbId].database!.rows.length).toBe(before + 1);
  });

  it("edits a cell and persists to the store", () => {
    const { dbId, view } = setup();
    render(<TableView pageId={dbId} view={view} />);
    const input = screen.getByDisplayValue("Task A");
    fireEvent.change(input, { target: { value: "Task A+" } });
    const nameCol = store().pages[dbId].database!.columns[0].id;
    expect(store().pages[dbId].database!.rows[0].cells[nameCol]).toBe("Task A+");
  });

  it("adds a column through the add-column menu", () => {
    const { dbId, view } = setup();
    const { container } = render(<TableView pageId={dbId} view={view} />);
    const before = store().pages[dbId].database!.columns.length;
    // header add-column button shows ＋
    const addButtons = screen.getAllByText("＋");
    fireEvent.click(addButtons[0]);
    fireEvent.click(screen.getByText("number"));
    expect(store().pages[dbId].database!.columns.length).toBe(before + 1);
    expect(container).toBeTruthy();
  });

  it("respects the view's filter when rendering rows", () => {
    const { dbId } = setup();
    const db = store().pages[dbId].database!;
    const statusCol = db.columns[1].id;
    const tableView = db.views.find((v) => v.type === "table")!;
    const filtered: DbView = {
      ...tableView,
      filters: [{ id: "f", columnId: statusCol, op: "is", value: "Done" }],
    };
    render(<TableView pageId={dbId} view={filtered} />);
    expect(screen.getByDisplayValue("Task C")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Task A")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Task B")).not.toBeInTheDocument();
  });

  it("deletes a row", () => {
    const { dbId, view } = setup();
    render(<TableView pageId={dbId} view={view} />);
    const before = store().pages[dbId].database!.rows.length;
    const firstRow = screen.getByDisplayValue("Task A").closest(".group") as HTMLElement;
    const del = within(firstRow).getByTitle("Delete row");
    fireEvent.click(del);
    expect(store().pages[dbId].database!.rows.length).toBe(before - 1);
  });
});
