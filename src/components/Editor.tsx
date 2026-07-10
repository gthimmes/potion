"use client";

import { useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import type { BlockType } from "@/lib/types";
import Block, { BlockHandlers } from "./Block";

function setCaretOffset(el: HTMLElement, offset: number) {
  el.focus();
  const sel = window.getSelection();
  const range = document.createRange();
  const node = el.firstChild ?? el;
  const max = el.textContent?.length ?? 0;
  const pos = Math.min(offset, max);
  if (node.nodeType === Node.TEXT_NODE) {
    range.setStart(node, pos);
  } else {
    range.selectNodeContents(el);
    range.collapse(false);
  }
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export default function Editor({ pageId }: { pageId: string }) {
  const page = useStore((s) => s.pages[pageId]);
  const insertBlock = useStore((s) => s.insertBlock);
  const deleteBlock = useStore((s) => s.deleteBlock);
  const updateBlock = useStore((s) => s.updateBlock);
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const blocks = page?.blocks ?? [];

  const focusBlock = useCallback((id: string, pos: "start" | "end") => {
    requestAnimationFrame(() => {
      const el = refs.current.get(id);
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(pos === "start");
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  }, []);

  const focusAtOffset = useCallback((id: string, offset: number) => {
    requestAnimationFrame(() => {
      const el = refs.current.get(id);
      if (el) setCaretOffset(el, offset);
    });
  }, []);

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  }, []);

  const handlers: BlockHandlers = useMemo(
    () => ({
      focusBlock,
      register,
      onEnter: (blockId, afterContent) => {
        const cur = useStore.getState().pages[pageId];
        const b = cur?.blocks.find((x) => x.id === blockId);
        const continues: BlockType[] = ["bullet", "numbered", "todo"];
        const newType: BlockType =
          b && continues.includes(b.type) ? b.type : "text";
        const newId = insertBlock(pageId, blockId, newType);
        if (afterContent) updateBlock(pageId, newId, afterContent);
        focusBlock(newId, "start");
      },
      onBackspaceMerge: (blockId) => {
        const cur = useStore.getState().pages[pageId];
        if (!cur) return;
        const idx = cur.blocks.findIndex((x) => x.id === blockId);
        if (idx <= 0) return;
        const prev = cur.blocks[idx - 1];
        const curBlock = cur.blocks[idx];
        if (prev.type === "divider") {
          deleteBlock(pageId, prev.id);
          focusBlock(blockId, "start");
          return;
        }
        const mergedAt = prev.content.length;
        updateBlock(pageId, prev.id, prev.content + curBlock.content);
        deleteBlock(pageId, blockId);
        focusAtOffset(prev.id, mergedAt);
      },
      onArrow: (blockId, dir) => {
        const cur = useStore.getState().pages[pageId];
        if (!cur) return;
        const idx = cur.blocks.findIndex((x) => x.id === blockId);
        const target =
          dir === "up" ? cur.blocks[idx - 1] : cur.blocks[idx + 1];
        if (target) focusBlock(target.id, dir === "up" ? "end" : "start");
      },
    }),
    [pageId, insertBlock, deleteBlock, updateBlock, focusBlock, focusAtOffset, register]
  );

  if (!page) return null;

  return (
    <div className="pb-32">
      {blocks.map((block, i) => (
        <Block
          key={block.id}
          pageId={pageId}
          block={block}
          index={i}
          handlers={handlers}
        />
      ))}
      {/* click-to-add area */}
      <div
        onClick={() => {
          const last = blocks[blocks.length - 1];
          if (last && last.content === "" && last.type === "text") {
            focusBlock(last.id, "end");
          } else if (last) {
            const id = insertBlock(pageId, last.id, "text");
            focusBlock(id, "start");
          }
        }}
        className="h-32 cursor-text"
      />
    </div>
  );
}
