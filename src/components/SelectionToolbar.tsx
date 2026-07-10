"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Rect {
  top: number;
  left: number;
  width: number;
}

function editableFromSelection(): HTMLElement | null {
  const sel = window.getSelection();
  const node = sel?.anchorNode;
  if (!node) return null;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  return (el?.closest(".potion-editable") as HTMLElement | null) ?? null;
}

export default function SelectionToolbar({
  onFormat,
}: {
  onFormat: (blockId: string, html: string) => void;
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const interacting = useRef(false);

  const recompute = useCallback(() => {
    if (interacting.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !editableFromSelection()) {
      setRect(null);
      setLinkMode(false);
      return;
    }
    const r = sel.getRangeAt(0).getBoundingClientRect();
    if (r.width === 0 && r.height === 0) {
      setRect(null);
      return;
    }
    setRect({ top: r.top, left: r.left + r.width / 2, width: r.width });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      document.removeEventListener("selectionchange", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [recompute]);

  const save = useCallback(() => {
    const editable = editableFromSelection();
    if (!editable) return;
    const blockId = editable.getAttribute("data-block-id");
    if (blockId) onFormat(blockId, editable.innerHTML);
  }, [onFormat]);

  const exec = (command: string) => {
    document.execCommand(command);
    save();
  };

  const wrapCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const code = document.createElement("code");
    try {
      code.appendChild(range.extractContents());
      range.insertNode(code);
      // reselect the code content
      const after = document.createRange();
      after.selectNodeContents(code);
      sel.removeAllRanges();
      sel.addRange(after);
    } catch {
      /* ignore selections spanning multiple blocks */
    }
    save();
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      const href = /^https?:\/\//.test(url) ? url : `https://${url}`;
      document.execCommand("createLink", false, href);
      save();
    }
    setLinkMode(false);
    setLinkUrl("");
    interacting.current = false;
    setRect(null);
  };

  if (!rect) return null;

  const btn =
    "flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm hover:bg-white/15";

  return (
    <div
      style={{
        position: "fixed",
        top: rect.top - 44,
        left: rect.left,
        transform: "translateX(-50%)",
        zIndex: 60,
      }}
      onMouseDown={(e) => {
        // keep the text selection while clicking toolbar buttons
        e.preventDefault();
        interacting.current = true;
      }}
      onMouseUp={() => {
        if (!linkMode) interacting.current = false;
      }}
      className="flex items-center gap-0.5 rounded-lg bg-[#2a2a2a] px-1 py-1 text-white shadow-xl"
    >
      {linkMode ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") {
                setLinkMode(false);
                interacting.current = false;
              }
            }}
            placeholder="Paste a link..."
            className="w-48 rounded bg-white/10 px-2 py-1 text-sm outline-none placeholder:text-white/40"
          />
          <button className={btn} onClick={applyLink}>
            Apply
          </button>
        </div>
      ) : (
        <>
          <button className={`${btn} font-bold`} onClick={() => exec("bold")} title="Bold">
            B
          </button>
          <button className={`${btn} italic`} onClick={() => exec("italic")} title="Italic">
            i
          </button>
          <button className={`${btn} underline`} onClick={() => exec("underline")} title="Underline">
            U
          </button>
          <button className={`${btn} line-through`} onClick={() => exec("strikeThrough")} title="Strikethrough">
            S
          </button>
          <button className={`${btn} font-mono`} onClick={wrapCode} title="Inline code">
            {"</>"}
          </button>
          <button
            className={btn}
            onClick={() => {
              interacting.current = true;
              setLinkMode(true);
            }}
            title="Link"
          >
            🔗
          </button>
        </>
      )}
    </div>
  );
}
