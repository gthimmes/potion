import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DatabaseView from "@/components/database/DatabaseView";
import { resetStore, store } from "@/test/resetStore";

function setup() {
  const dbId = store().createPage(null, true);
  return dbId;
}

beforeEach(() => resetStore());

describe("DatabaseView", () => {
  it("switches between Table and Board views", () => {
    const dbId = setup();
    render(<DatabaseView pageId={dbId} />);
    // table view: cells rendered as inputs
    expect(screen.getByDisplayValue("Task A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Board/ }));
    // board view: cards render task names as text, and group columns appear
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("filters rows through the filter UI", () => {
    const dbId = setup();
    const db = store().pages[dbId].database!;
    const statusColId = db.columns[1].id;
    render(<DatabaseView pageId={dbId} />);

    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add filter/ }));

    // comboboxes: [column, operator]
    let combos = screen.getAllByRole("combobox");
    fireEvent.change(combos[0], { target: { value: statusColId } }); // column -> Status

    // now select-typed value control appears; op defaults to "is"
    combos = screen.getAllByRole("combobox");
    // last combobox is the value picker for a select column
    const valueSelect = combos[combos.length - 1];
    fireEvent.change(valueSelect, { target: { value: "Done" } });

    expect(screen.getByDisplayValue("Task C")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Task A")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Task B")).not.toBeInTheDocument();

    // filter is persisted to the view
    const view = store().pages[dbId].database!.views.find((v) => v.type === "table")!;
    expect(view.filters).toHaveLength(1);
  });

  it("sorts rows through the sort UI", () => {
    const dbId = setup();
    render(<DatabaseView pageId={dbId} />);

    fireEvent.click(screen.getByRole("button", { name: /Sort/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add sort/ }));

    // comboboxes: [column, direction]
    const combos = screen.getAllByRole("combobox");
    fireEvent.change(combos[1], { target: { value: "desc" } }); // direction -> desc

    const view = store().pages[dbId].database!.views.find((v) => v.type === "table")!;
    expect(view.sorts).toHaveLength(1);
    expect(view.sorts![0].dir).toBe("desc");

    // rows visually reordered: first rendered name input is Task C
    const inputs = screen.getAllByDisplayValue(/Task [ABC]/);
    expect((inputs[0] as HTMLInputElement).value).toBe("Task C");
  });
});
