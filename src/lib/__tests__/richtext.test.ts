import { afterEach, describe, expect, it } from "vitest";
import {
  replaceTriggerToken,
  setTextCaret,
  splitAtCaret,
  stripHtml,
} from "@/lib/richtext";

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLDivElement {
  const el = document.createElement("div");
  el.contentEditable = "true";
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

function caretAt(node: Node, offset: number) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
}

describe("stripHtml", () => {
  it("removes tags and returns text content", () => {
    expect(stripHtml("Hello <b>world</b>")).toBe("Hello world");
    expect(stripHtml('a <a href="#">link</a> here')).toBe("a link here");
    expect(stripHtml("plain")).toBe("plain");
    expect(stripHtml("")).toBe("");
  });
});

describe("splitAtCaret", () => {
  it("splits plain text at the caret", () => {
    const el = mount("hello world");
    caretAt(el.firstChild!, 5);
    const { before, after } = splitAtCaret(el);
    expect(before).toBe("hello");
    expect(after).toBe(" world");
  });

  it("returns everything as before when caret is at the end", () => {
    const el = mount("done");
    caretAt(el.firstChild!, 4);
    const { before, after } = splitAtCaret(el);
    expect(before).toBe("done");
    expect(after).toBe("");
  });
});

describe("setTextCaret", () => {
  it("places the caret at a text offset spanning inline nodes", () => {
    const el = mount("ab<b>cd</b>ef"); // text length 6
    setTextCaret(el, 4); // inside/after <b>cd</b>
    const sel = window.getSelection()!;
    expect(sel.rangeCount).toBe(1);
    expect(sel.getRangeAt(0).collapsed).toBe(true);
  });
});

describe("replaceTriggerToken", () => {
  it("replaces a trailing @token with a node and returns true", () => {
    const el = mount("hi @Design");
    // caret at end of the text node
    caretAt(el.firstChild!, el.firstChild!.textContent!.length);
    const chip = document.createElement("a");
    chip.setAttribute("data-page-id", "p1");
    chip.textContent = "Design Doc";
    const ok = replaceTriggerToken(el, "@", chip);
    expect(ok).toBe(true);
    expect(el.querySelector("[data-page-id]")).not.toBeNull();
    expect(stripHtml(el.innerHTML)).toContain("hi ");
    expect(stripHtml(el.innerHTML)).not.toContain("@Design");
  });

  it("returns false when no trigger char precedes the caret", () => {
    const el = mount("no trigger here");
    caretAt(el.firstChild!, 5);
    const node = document.createElement("span");
    expect(replaceTriggerToken(el, "@", node)).toBe(false);
  });
});
