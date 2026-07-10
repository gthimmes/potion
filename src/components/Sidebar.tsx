"use client";

import { useState } from "react";
import clsx from "clsx";
import { useStore } from "@/store/useStore";

function PageTreeItem({ id, depth }: { id: string; depth: number }) {
  const page = useStore((s) => s.pages[id]);
  const currentPageId = useStore((s) => s.currentPageId);
  const expanded = useStore((s) => s.expanded[id]);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const toggleExpanded = useStore((s) => s.toggleExpanded);
  const createPage = useStore((s) => s.createPage);
  const deletePage = useStore((s) => s.deletePage);
  const [hover, setHover] = useState(false);

  if (!page) return null;
  const hasChildren = page.children.length > 0;
  const active = currentPageId === id;

  return (
    <div>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setCurrentPage(id)}
        className={clsx(
          "group flex items-center gap-1 rounded-md py-1 pr-1 text-sm cursor-pointer select-none",
          active ? "font-medium" : "text-soft",
          "hover-app"
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(id);
          }}
          className={clsx(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-black/10",
            !hasChildren && !hover && "opacity-0"
          )}
        >
          <span
            className="text-[10px] transition-transform"
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          >
            ▶
          </span>
        </button>
        <span className="shrink-0 text-base leading-none">{page.icon}</span>
        <span className="flex-1 truncate">{page.title || "Untitled"}</span>
        <div
          className={clsx(
            "flex items-center gap-0.5",
            hover ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${page.title || "Untitled"}" and its subpages?`))
                deletePage(id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10"
          >
            🗑
          </button>
          <button
            title="Add subpage"
            onClick={(e) => {
              e.stopPropagation();
              createPage(id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10"
          >
            +
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {page.children.map((childId) => (
            <PageTreeItem key={childId} id={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onOpenFind }: { onOpenFind: () => void }) {
  const rootOrder = useStore((s) => s.rootOrder);
  const createPage = useStore((s) => s.createPage);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="bg-sidebar border-app flex w-10 flex-col items-center border-r py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="hover-app flex h-7 w-7 items-center justify-center rounded"
          title="Expand sidebar"
        >
          »
        </button>
      </div>
    );
  }

  return (
    <div className="bg-sidebar border-app flex w-64 flex-col border-r">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-lg">⚗️</span>
          <span>Potion</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="hover-app flex h-6 w-6 items-center justify-center rounded text-soft"
          title="Collapse sidebar"
        >
          «
        </button>
      </div>

      <div className="px-2">
        <button
          onClick={onOpenFind}
          className="hover-app flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-soft"
        >
          <span>🔍</span>
          <span>Quick Find</span>
          <span className="ml-auto text-xs opacity-60">⌘K</span>
        </button>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
        <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-soft">
          Workspace
        </div>
        {rootOrder.map((id) => (
          <PageTreeItem key={id} id={id} depth={0} />
        ))}
      </div>

      <div className="border-app space-y-1 border-t p-2">
        <button
          onClick={() => createPage(null, false)}
          className="hover-app flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-soft"
        >
          <span>＋</span> New page
        </button>
        <button
          onClick={() => createPage(null, true)}
          className="hover-app flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-soft"
        >
          <span>🗂️</span> New database
        </button>
        <button
          onClick={toggleTheme}
          className="hover-app flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-soft"
        >
          <span>{theme === "light" ? "🌙" : "☀️"}</span>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>
    </div>
  );
}
