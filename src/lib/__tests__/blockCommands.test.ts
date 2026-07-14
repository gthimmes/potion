import { describe, expect, it } from "vitest";
import {
  BLOCK_COMMANDS,
  filterCommands,
  markdownShortcut,
} from "@/lib/blockCommands";

describe("filterCommands", () => {
  it("returns all commands for an empty query", () => {
    expect(filterCommands("")).toEqual(BLOCK_COMMANDS);
  });

  it("matches by label", () => {
    const r = filterCommands("head");
    expect(r.map((c) => c.type)).toEqual(
      expect.arrayContaining(["h1", "h2", "h3"])
    );
  });

  it("matches by keyword", () => {
    expect(filterCommands("checkbox").map((c) => c.type)).toContain("todo");
    expect(filterCommands("kanban").length).toBe(0);
  });

  it("is case-insensitive", () => {
    expect(filterCommands("DATABASE").map((c) => c.type)).toContain("database");
  });
});

describe("markdownShortcut", () => {
  it("maps heading tokens", () => {
    expect(markdownShortcut("#")).toBe("h1");
    expect(markdownShortcut("##")).toBe("h2");
    expect(markdownShortcut("###")).toBe("h3");
  });

  it("maps list and quote tokens", () => {
    expect(markdownShortcut("-")).toBe("bullet");
    expect(markdownShortcut("*")).toBe("bullet");
    expect(markdownShortcut("1.")).toBe("numbered");
    expect(markdownShortcut("[]")).toBe("todo");
    expect(markdownShortcut("[ ]")).toBe("todo");
    expect(markdownShortcut(">")).toBe("quote");
    expect(markdownShortcut("```")).toBe("code");
  });

  it("returns null for unknown tokens", () => {
    expect(markdownShortcut("hello")).toBeNull();
    expect(markdownShortcut("")).toBeNull();
  });
});
