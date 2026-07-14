import { describe, expect, it } from "vitest";
import { COVER_GRADIENTS, COVER_KEYS, SELECT_COLORS, selectColor } from "@/lib/constants";

describe("selectColor", () => {
  it("is deterministic for the same value", () => {
    expect(selectColor("Done")).toBe(selectColor("Done"));
  });

  it("always returns a color from the palette", () => {
    for (const v of ["Done", "Todo", "In progress", "x", "", "🚀"]) {
      expect(SELECT_COLORS).toContain(selectColor(v));
    }
  });
});

describe("cover gradients", () => {
  it("keys map to gradient strings", () => {
    expect(COVER_KEYS.length).toBeGreaterThan(0);
    for (const k of COVER_KEYS) {
      expect(COVER_GRADIENTS[k]).toMatch(/gradient/);
    }
  });
});
