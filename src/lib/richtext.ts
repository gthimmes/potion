// Helpers for rich-text block content stored as inline HTML
// (only inline formatting: <b>/<strong>, <i>/<em>, <u>, <s>, <code>, <a>).

export function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent ?? "";
}

// Split the given editable element's content at the current caret into
// { before, after } HTML strings, mutating the element to hold `before`.
export function splitAtCaret(el: HTMLElement): { before: string; after: string } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return { before: el.innerHTML, after: "" };
  }
  const caret = sel.getRangeAt(0);
  const after = document.createRange();
  after.selectNodeContents(el);
  after.setStart(caret.endContainer, caret.endOffset);
  const frag = after.extractContents();
  const tmp = document.createElement("div");
  tmp.appendChild(frag);
  return { before: el.innerHTML, after: tmp.innerHTML };
}

// Replace the trailing "<trigger>query" token (e.g. "@Design") at the caret
// with the given node, then place the caret just after it.
export function replaceTriggerToken(
  el: HTMLElement,
  trigger: string,
  node: Node
): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  const textNode = range.endContainer;
  const offset = range.endOffset;
  if (textNode.nodeType !== Node.TEXT_NODE) return false;
  const data = textNode.textContent ?? "";
  const at = data.lastIndexOf(trigger, offset - 1);
  if (at < 0) return false;

  const del = document.createRange();
  del.setStart(textNode, at);
  del.setEnd(textNode, offset);
  del.deleteContents();
  del.insertNode(node);

  const space = document.createTextNode(" ");
  (node as ChildNode).after(space);

  const caret = document.createRange();
  caret.setStartAfter(space);
  caret.collapse(true);
  sel.removeAllRanges();
  sel.addRange(caret);
  void el;
  return true;
}

// Place the caret at a given text offset inside an element that may
// contain nested inline elements.
export function setTextCaret(el: HTMLElement, offset: number) {
  el.focus();
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  let remaining = offset;
  let placed = false;

  const walk = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        range.setStart(node, remaining);
        placed = true;
        return true;
      }
      remaining -= len;
      return false;
    }
    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  };

  walk(el);
  if (!placed) {
    range.selectNodeContents(el);
    range.collapse(false);
  } else {
    range.collapse(true);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}
