import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/Sidebar";
import { resetStore, store } from "@/test/resetStore";

beforeEach(() => resetStore());

describe("Sidebar", () => {
  it("creates a new page from the footer button", () => {
    render(<Sidebar onOpenFind={() => {}} />);
    expect(store().rootOrder).toHaveLength(0);
    fireEvent.click(screen.getByText(/New page/));
    expect(store().rootOrder).toHaveLength(1);
    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  it("creates a new database from the footer button", () => {
    render(<Sidebar onOpenFind={() => {}} />);
    fireEvent.click(screen.getByText(/New database/));
    expect(store().rootOrder).toHaveLength(1);
    const id = store().rootOrder[0];
    expect(store().pages[id].isDatabase).toBe(true);
  });

  it("selects a page when its tree row is clicked", () => {
    const a = store().createPage(null, false);
    store().setTitle(a, "Alpha");
    const b = store().createPage(null, false);
    store().setTitle(b, "Beta");
    store().setCurrentPage(a);

    render(<Sidebar onOpenFind={() => {}} />);
    fireEvent.click(screen.getByText("Beta"));
    expect(store().currentPageId).toBe(b);
  });

  it("adds a subpage from the row's + control", () => {
    const a = store().createPage(null, false);
    store().setTitle(a, "Parent");
    render(<Sidebar onOpenFind={() => {}} />);
    fireEvent.click(screen.getByTitle("Add subpage"));
    expect(store().pages[a].children).toHaveLength(1);
  });

  it("deletes a page after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const a = store().createPage(null, false);
    store().setTitle(a, "Doomed");
    render(<Sidebar onOpenFind={() => {}} />);
    fireEvent.click(screen.getByTitle("Delete"));
    expect(confirm).toHaveBeenCalled();
    expect(store().pages[a]).toBeUndefined();
    confirm.mockRestore();
  });

  it("opens quick find via the search button", () => {
    const onOpenFind = vi.fn();
    render(<Sidebar onOpenFind={onOpenFind} />);
    fireEvent.click(screen.getByText(/Quick Find/));
    expect(onOpenFind).toHaveBeenCalled();
  });
});
