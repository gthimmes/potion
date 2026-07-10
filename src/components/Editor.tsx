"use client";

import { useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import type { BlockType } from "@/lib/types";
import { setTextCaret, stripHtml } from "@/lib/richtext";
import Block, { BlockHandlers } from "./Block";
import SelectionToolbar from "./SelectionToolbar";
import SortableBlock from "./SortableBlock";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function Editor({ pageId }: { pageId: string }) {
  const page = useStore((s) => s.pages[pageId]);
  const insertBlock = useStore((s) => s.insertBlock);
  const deleteBlock = useStore((s) => s.deleteBlock);
  const updateBlock = useStore((s) => s.updateBlock);
  const moveBlock = useStore((s) => s.moveBlock);
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
      if (el) setTextCaret(el, offset);
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
        const mergedAt = stripHtml(prev.content).length;
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from >= 0 && to >= 0) moveBlock(pageId, from, to);
  };

  if (!page) return null;

  return (
    <div className="pb-32">
      <SelectionToolbar onFormat={(id, html) => updateBlock(pageId, id, html)} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, i) => (
            <SortableBlock key={block.id} id={block.id}>
              <Block
                pageId={pageId}
                block={block}
                index={i}
                handlers={handlers}
              />
            </SortableBlock>
          ))}
        </SortableContext>
      </DndContext>
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
