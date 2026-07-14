import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuickFind from "@/components/QuickFind";
import { resetStore, store } from "@/test/resetStore";

function seed() {
  const a = store().createPage(null, false);
  store().setTitle(a, "Roadmap");
  const b = store().createPage(null, false);
  store().setTitle(b, "Meeting Notes");
  store().updateBlock(b, store().pages[b].blocks[0].id, "discuss the budget");
  return { a, b };
}

beforeEach(() => resetStore());

describe("QuickFind", () => {
  it("matches pages by title", () => {
    seed();
    render(<QuickFind onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Search pages..."), {
      target: { value: "road" },
    });
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Meeting Notes")).not.toBeInTheDocument();
  });

  it("matches pages by block content", () => {
    seed();
    render(<QuickFind onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Search pages..."), {
      target: { value: "budget" },
    });
    expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
    expect(screen.queryByText("Roadmap")).not.toBeInTheDocument();
  });

  it("opens the highlighted result on Enter and closes", () => {
    const { a } = seed();
    const onClose = vi.fn();
    render(<QuickFind onClose={onClose} />);
    const input = screen.getByPlaceholderText("Search pages...");
    fireEvent.change(input, { target: { value: "Roadmap" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(store().currentPageId).toBe(a);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an empty state for no matches", () => {
    seed();
    render(<QuickFind onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Search pages..."), {
      target: { value: "zzzzz" },
    });
    expect(screen.getByText("No pages found")).toBeInTheDocument();
  });
});
