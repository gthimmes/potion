"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { useStore } from "@/store/useStore";
import type { Block as BlockT, BlockType, Page } from "@/lib/types";
import {
  BlockCommand,
  filterCommands,
  markdownShortcut,
} from "@/lib/blockCommands";
import { splitAtCaret, replaceTriggerToken } from "@/lib/richtext";
import SlashMenu from "./SlashMenu";
import MentionMenu from "./MentionMenu";
import ImageBlock from "./ImageBlock";

export interface BlockHandlers {
  focusBlock: (id: string, pos: "start" | "end") => void;
  register: (id: string, el: HTMLElement | null) => void;
  onEnter: (blockId: string, afterContent: string) => void;
  onBackspaceMerge: (blockId: string) => void;
  onArrow: (blockId: string, dir: "up" | "down") => void;
}

// --- caret helpers ---
function caretOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0).cloneRange();
  range.selectNodeContents(el);
  range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  return range.toString().length;
}

function setCaret(el: HTMLElement, pos: "start" | "end") {
  el.focus();
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(pos === "start");
  sel?.removeAllRanges();
  sel?.addRange(range);
}

const TYPE_CLASS: Record<BlockType, string> = {
  text: "text-[16px] leading-7",
  h1: "text-3xl font-bold mt-4 mb-1",
  h2: "text-2xl font-bold mt-3 mb-1",
  h3: "text-xl font-semibold mt-2 mb-0.5",
  todo: "text-[16px] leading-7",
  bullet: "text-[16px] leading-7",
  numbered: "text-[16px] leading-7",
  quote: "text-[16px] leading-7 italic",
  callout: "text-[16px] leading-7",
  code: "font-mono text-sm leading-6",
  image: "",
  divider: "",
};

const PLACEHOLDER: Partial<Record<BlockType, string>> = {
  text: "Type '/' for commands",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  quote: "Empty quote",
  callout: "Callout",
  code: "Code",
};

export default function Block({
  pageId,
  block,
  index,
  handlers,
}: {
  pageId: string;
  block: BlockT;
  index: number;
  handlers: BlockHandlers;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const updateBlock = useStore((s) => s.updateBlock);
  const setBlockType = useStore((s) => s.setBlockType);
  const toggleTodo = useStore((s) => s.toggleTodo);
  const setCurrentPage = useStore((s) => s.setCurrentPage);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  // Non-reactive snapshot of pages, filtered by the current @ query.
  const mentionPages: Page[] = mentionOpen
    ? Object.values(useStore.getState().pages)
        .filter((p) =>
          (p.title || "Untitled")
            .toLowerCase()
            .includes(mentionQuery.trim().toLowerCase())
        )
        .slice(0, 8)
    : [];

  // Sync DOM from state when not focused (external changes).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerHTML !== block.content) {
      el.innerHTML = block.content;
    }
  }, [block.content]);

  // Register element for focus coordination.
  useEffect(() => {
    handlers.register(block.id, ref.current);
    return () => handlers.register(block.id, null);
  }, [block.id, handlers]);

  const commands = filterCommands(slashQuery);

  const applyType = useCallback(
    (type: BlockType, clearContent = false) => {
      setBlockType(pageId, block.id, type);
      if (clearContent && ref.current) {
        ref.current.textContent = "";
        updateBlock(pageId, block.id, "");
      }
      setSlashOpen(false);
      setSlashQuery("");
      requestAnimationFrame(() => {
        if (ref.current) setCaret(ref.current, "end");
      });
    },
    [pageId, block.id, setBlockType, updateBlock]
  );

  const selectCommand = useCallback(
    (cmd: BlockCommand) => {
      // remove the trailing "/query" token, preserving any earlier formatting
      if (ref.current) {
        const cleaned = ref.current.innerHTML.replace(/\/[^<>/]*$/, "");
        ref.current.innerHTML = cleaned;
        updateBlock(pageId, block.id, cleaned);
      }
      if (cmd.type === "divider") {
        applyType("divider");
        handlers.onEnter(block.id, "");
      } else {
        applyType(cmd.type);
      }
    },
    [applyType, block.id, handlers, pageId, updateBlock]
  );

  const selectMention = useCallback(
    (page: Page) => {
      const el = ref.current;
      if (!el) return;
      const link = document.createElement("a");
      link.setAttribute("data-page-id", page.id);
      link.setAttribute("contenteditable", "false");
      link.className = "potion-mention";
      link.textContent = `${page.icon} ${page.title || "Untitled"}`;
      replaceTriggerToken(el, "@", link);
      updateBlock(pageId, block.id, el.innerHTML);
      setMentionOpen(false);
      setMentionQuery("");
    },
    [block.id, pageId, updateBlock]
  );

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    updateBlock(pageId, block.id, el.innerHTML);

    // slash detection (against plain text)
    const text = el.textContent ?? "";
    const slashPos = text.lastIndexOf("/");
    if (slashOpen) {
      if (slashPos < 0) {
        setSlashOpen(false);
      } else {
        setSlashQuery(text.slice(slashPos + 1));
        setSlashIndex(0);
      }
    }

    // @-mention detection
    if (mentionOpen) {
      const atPos = text.lastIndexOf("@");
      if (atPos < 0 || /\s/.test(text.slice(atPos + 1))) {
        setMentionOpen(false);
      } else {
        setMentionQuery(text.slice(atPos + 1));
        setMentionIndex(0);
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    // Slash menu navigation
    if (slashOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => Math.min(i + 1, commands.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (commands[slashIndex]) selectCommand(commands[slashIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashOpen(false);
        setSlashQuery("");
        return;
      }
    }

    // Mention menu navigation
    if (mentionOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionPages.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (mentionPages[mentionIndex]) selectMention(mentionPages[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
        setMentionQuery("");
        return;
      }
    }

    // Open slash menu
    if (e.key === "/" && !slashOpen) {
      setSlashOpen(true);
      setSlashQuery("");
      setSlashIndex(0);
      return;
    }

    // Open mention menu
    if (e.key === "@" && !mentionOpen) {
      setMentionOpen(true);
      setMentionQuery("");
      setMentionIndex(0);
      return;
    }

    // Markdown shortcut on space
    if (e.key === " ") {
      const offset = caretOffset(el);
      const text = el.textContent ?? "";
      const token = text.slice(0, offset);
      const type = markdownShortcut(token);
      if (type && offset === token.length) {
        e.preventDefault();
        // strip the leading token (safe: it's plain text at the very start)
        const rest = text.slice(offset);
        el.textContent = rest;
        updateBlock(pageId, block.id, rest);
        applyType(type);
        return;
      }
    }

    // Enter -> split / new block
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = el.textContent ?? "";
      // exit list on empty enter
      if (
        text.length === 0 &&
        (block.type === "bullet" ||
          block.type === "numbered" ||
          block.type === "todo")
      ) {
        setBlockType(pageId, block.id, "text");
        return;
      }
      const { before, after } = splitAtCaret(el);
      updateBlock(pageId, block.id, before);
      handlers.onEnter(block.id, after);
      return;
    }

    // Backspace at start
    if (e.key === "Backspace") {
      const offset = caretOffset(el);
      const text = el.textContent ?? "";
      if (offset === 0 && window.getSelection()?.isCollapsed) {
        // first, demote non-text empty block to text
        if (block.type !== "text" && text.length === 0) {
          e.preventDefault();
          setBlockType(pageId, block.id, "text");
          return;
        }
        e.preventDefault();
        handlers.onBackspaceMerge(block.id);
        return;
      }
    }

    // Arrow navigation across blocks
    if (e.key === "ArrowUp") {
      if (caretOffset(el) === 0) {
        e.preventDefault();
        handlers.onArrow(block.id, "up");
      }
    }
    if (e.key === "ArrowDown") {
      const text = el.textContent ?? "";
      if (caretOffset(el) === text.length) {
        e.preventDefault();
        handlers.onArrow(block.id, "down");
      }
    }
  };

  // ---- Divider is not text-editable ----
  if (block.type === "divider") {
    return (
      <div className="group relative py-2">
        <hr className="border-app" />
      </div>
    );
  }

  // ---- Image block ----
  if (block.type === "image") {
    return (
      <div className="group relative py-0.5">
        <ImageBlock pageId={pageId} block={block} />
      </div>
    );
  }

  // Navigate when an inline @-mention chip is clicked.
  const onEditableClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const mention = target.closest?.("[data-page-id]");
    if (mention) {
      e.preventDefault();
      const id = mention.getAttribute("data-page-id");
      if (id) setCurrentPage(id);
    }
  };

  const editable = (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-block-id={block.id}
      data-placeholder={PLACEHOLDER[block.type] ?? ""}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onClick={onEditableClick}
      className={clsx("potion-editable flex-1 outline-none", TYPE_CLASS[block.type])}
    />
  );

  // Wrap with per-type decorations
  let body = editable;
  if (block.type === "todo") {
    body = (
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={!!block.checked}
          onChange={() => toggleTodo(pageId, block.id)}
          className="mt-2 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
        />
        <div className={clsx("flex-1", block.checked && "text-soft line-through")}>
          {editable}
        </div>
      </div>
    );
  } else if (block.type === "bullet") {
    body = (
      <div className="flex items-start gap-2">
        <span className="mt-2.5 text-lg leading-none">•</span>
        {editable}
      </div>
    );
  } else if (block.type === "numbered") {
    body = (
      <div className="flex items-start gap-2">
        <span className="mt-1 min-w-5 text-right tabular-nums text-soft">
          {index + 1}.
        </span>
        {editable}
      </div>
    );
  } else if (block.type === "quote") {
    body = (
      <div className="border-l-4 border-current pl-3 opacity-90">{editable}</div>
    );
  } else if (block.type === "callout") {
    body = (
      <div className="flex items-start gap-2 rounded-md bg-black/5 p-3 dark:bg-white/5">
        <span className="text-lg">💡</span>
        {editable}
      </div>
    );
  } else if (block.type === "code") {
    body = (
      <div className="rounded-md bg-black/5 p-3 dark:bg-white/10">{editable}</div>
    );
  }

  return (
    <div className="group relative py-0.5">
      {body}
      {slashOpen && (
        <SlashMenu
          items={commands}
          activeIndex={slashIndex}
          onHover={setSlashIndex}
          onSelect={selectCommand}
        />
      )}
      {mentionOpen && (
        <MentionMenu
          items={mentionPages}
          activeIndex={mentionIndex}
          onHover={setMentionIndex}
          onSelect={selectMention}
        />
      )}
    </div>
  );
}
