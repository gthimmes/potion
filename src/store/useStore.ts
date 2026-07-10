"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  Block,
  BlockType,
  ColumnType,
  Database,
  DbColumn,
  DbRow,
  Page,
  Theme,
  ViewType,
} from "@/lib/types";

const now = () => Date.now();

function newBlock(type: BlockType = "text", content = ""): Block {
  return { id: nanoid(), type, content };
}

function emptyDatabase(): Database {
  const nameCol: DbColumn = { id: nanoid(), name: "Name", type: "text" };
  const statusCol: DbColumn = {
    id: nanoid(),
    name: "Status",
    type: "select",
    options: ["Not started", "In progress", "Done"],
  };
  const viewId = nanoid();
  const rows: DbRow[] = ["Task A", "Task B", "Task C"].map((t, i) => ({
    id: nanoid(),
    cells: {
      [nameCol.id]: t,
      [statusCol.id]: ["Not started", "In progress", "Done"][i],
    },
  }));
  return {
    columns: [nameCol, statusCol],
    rows,
    views: [
      { id: viewId, name: "Table", type: "table" },
      { id: nanoid(), name: "Board", type: "board", groupBy: statusCol.id },
    ],
    activeViewId: viewId,
  };
}

function newPage(parentId: string | null, isDatabase = false): Page {
  return {
    id: nanoid(),
    title: "",
    icon: isDatabase ? "🗂️" : "📄",
    cover: null,
    parentId,
    children: [],
    blocks: isDatabase ? [] : [newBlock()],
    isDatabase,
    database: isDatabase ? emptyDatabase() : undefined,
    createdAt: now(),
    updatedAt: now(),
  };
}

interface StoreState {
  pages: Record<string, Page>;
  rootOrder: string[];
  currentPageId: string | null;
  theme: Theme;
  expanded: Record<string, boolean>;

  // navigation / ui
  setCurrentPage: (id: string) => void;
  toggleExpanded: (id: string) => void;
  toggleTheme: () => void;

  // page ops
  createPage: (parentId: string | null, isDatabase?: boolean) => string;
  deletePage: (id: string) => void;
  setTitle: (id: string, title: string) => void;
  setIcon: (id: string, icon: string) => void;
  setCover: (id: string, cover: string | null) => void;
  movePage: (id: string, newParentId: string | null, index: number) => void;

  // block ops
  updateBlock: (pageId: string, blockId: string, content: string) => void;
  setBlockType: (pageId: string, blockId: string, type: BlockType) => void;
  toggleTodo: (pageId: string, blockId: string) => void;
  insertBlock: (pageId: string, afterBlockId: string, type?: BlockType) => string;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, from: number, to: number) => void;

  // database ops
  setActiveView: (pageId: string, viewId: string) => void;
  addRow: (pageId: string) => void;
  deleteRow: (pageId: string, rowId: string) => void;
  updateCell: (pageId: string, rowId: string, columnId: string, value: string) => void;
  addColumn: (pageId: string, type: ColumnType) => void;
  renameColumn: (pageId: string, columnId: string, name: string) => void;
  deleteColumn: (pageId: string, columnId: string) => void;
  addSelectOption: (pageId: string, columnId: string, option: string) => void;
}

function touch(page: Page): Page {
  return { ...page, updatedAt: now() };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      pages: {},
      rootOrder: [],
      currentPageId: null,
      theme: "light",
      expanded: {},

      setCurrentPage: (id) => set({ currentPageId: id }),
      toggleExpanded: (id) =>
        set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      createPage: (parentId, isDatabase = false) => {
        const page = newPage(parentId, isDatabase);
        set((s) => {
          const pages = { ...s.pages, [page.id]: page };
          if (parentId && pages[parentId]) {
            pages[parentId] = touch({
              ...pages[parentId],
              children: [...pages[parentId].children, page.id],
            });
          }
          return {
            pages,
            rootOrder: parentId ? s.rootOrder : [...s.rootOrder, page.id],
            currentPageId: page.id,
            expanded: parentId ? { ...s.expanded, [parentId]: true } : s.expanded,
          };
        });
        return page.id;
      },

      deletePage: (id) => {
        set((s) => {
          const pages = { ...s.pages };
          const toDelete: string[] = [];
          const collect = (pid: string) => {
            toDelete.push(pid);
            pages[pid]?.children.forEach(collect);
          };
          collect(id);
          const page = pages[id];
          toDelete.forEach((pid) => delete pages[pid]);

          // detach from parent
          if (page?.parentId && pages[page.parentId]) {
            pages[page.parentId] = touch({
              ...pages[page.parentId],
              children: pages[page.parentId].children.filter((c) => c !== id),
            });
          }
          const rootOrder = s.rootOrder.filter((r) => r !== id);
          let currentPageId = s.currentPageId;
          if (currentPageId && toDelete.includes(currentPageId)) {
            currentPageId = rootOrder[0] ?? null;
          }
          return { pages, rootOrder, currentPageId };
        });
      },

      setTitle: (id, title) =>
        set((s) => ({
          pages: { ...s.pages, [id]: touch({ ...s.pages[id], title }) },
        })),
      setIcon: (id, icon) =>
        set((s) => ({
          pages: { ...s.pages, [id]: touch({ ...s.pages[id], icon }) },
        })),
      setCover: (id, cover) =>
        set((s) => ({
          pages: { ...s.pages, [id]: touch({ ...s.pages[id], cover }) },
        })),

      movePage: (id, newParentId, index) => {
        set((s) => {
          const pages = { ...s.pages };
          const page = pages[id];
          if (!page) return s;
          // prevent moving into own descendant
          let cursor: string | null = newParentId;
          while (cursor) {
            if (cursor === id) return s;
            cursor = pages[cursor]?.parentId ?? null;
          }
          // remove from old location
          let rootOrder = [...s.rootOrder];
          if (page.parentId && pages[page.parentId]) {
            pages[page.parentId] = {
              ...pages[page.parentId],
              children: pages[page.parentId].children.filter((c) => c !== id),
            };
          } else {
            rootOrder = rootOrder.filter((r) => r !== id);
          }
          // insert into new location
          if (newParentId && pages[newParentId]) {
            const children = [...pages[newParentId].children];
            children.splice(index, 0, id);
            pages[newParentId] = { ...pages[newParentId], children };
          } else {
            rootOrder.splice(index, 0, id);
          }
          pages[id] = { ...page, parentId: newParentId };
          return { pages, rootOrder };
        });
      },

      updateBlock: (pageId, blockId, content) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page) return s;
          const blocks = page.blocks.map((b) =>
            b.id === blockId ? { ...b, content } : b
          );
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        }),

      setBlockType: (pageId, blockId, type) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page) return s;
          const blocks = page.blocks.map((b) =>
            b.id === blockId ? { ...b, type } : b
          );
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        }),

      toggleTodo: (pageId, blockId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page) return s;
          const blocks = page.blocks.map((b) =>
            b.id === blockId ? { ...b, checked: !b.checked } : b
          );
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        }),

      insertBlock: (pageId, afterBlockId, type = "text") => {
        const block = newBlock(type);
        set((s) => {
          const page = s.pages[pageId];
          if (!page) return s;
          const idx = page.blocks.findIndex((b) => b.id === afterBlockId);
          const blocks = [...page.blocks];
          blocks.splice(idx + 1, 0, block);
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        });
        return block.id;
      },

      deleteBlock: (pageId, blockId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page || page.blocks.length <= 1) return s;
          const blocks = page.blocks.filter((b) => b.id !== blockId);
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        }),

      moveBlock: (pageId, from, to) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page) return s;
          const blocks = [...page.blocks];
          const [moved] = blocks.splice(from, 1);
          blocks.splice(to, 0, moved);
          return { pages: { ...s.pages, [pageId]: touch({ ...page, blocks }) } };
        }),

      // ---- database ----
      setActiveView: (pageId, viewId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, activeViewId: viewId },
              }),
            },
          };
        }),

      addRow: (pageId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          const row: DbRow = { id: nanoid(), cells: {} };
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, rows: [...page.database.rows, row] },
              }),
            },
          };
        }),

      deleteRow: (pageId, rowId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: {
                  ...page.database,
                  rows: page.database.rows.filter((r) => r.id !== rowId),
                },
              }),
            },
          };
        }),

      updateCell: (pageId, rowId, columnId, value) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          const rows = page.database.rows.map((r) =>
            r.id === rowId ? { ...r, cells: { ...r.cells, [columnId]: value } } : r
          );
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, rows },
              }),
            },
          };
        }),

      addColumn: (pageId, type) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          const col: DbColumn = {
            id: nanoid(),
            name: type.charAt(0).toUpperCase() + type.slice(1),
            type,
            options: type === "select" ? [] : undefined,
          };
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: {
                  ...page.database,
                  columns: [...page.database.columns, col],
                },
              }),
            },
          };
        }),

      renameColumn: (pageId, columnId, name) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          const columns = page.database.columns.map((c) =>
            c.id === columnId ? { ...c, name } : c
          );
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, columns },
              }),
            },
          };
        }),

      deleteColumn: (pageId, columnId) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database || page.database.columns.length <= 1) return s;
          const columns = page.database.columns.filter((c) => c.id !== columnId);
          const rows = page.database.rows.map((r) => {
            const cells = { ...r.cells };
            delete cells[columnId];
            return { ...r, cells };
          });
          const views = page.database.views.map((v) =>
            v.groupBy === columnId ? { ...v, groupBy: undefined } : v
          );
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, columns, rows, views },
              }),
            },
          };
        }),

      addSelectOption: (pageId, columnId, option) =>
        set((s) => {
          const page = s.pages[pageId];
          if (!page?.database) return s;
          const columns = page.database.columns.map((c) =>
            c.id === columnId && c.type === "select"
              ? {
                  ...c,
                  options: c.options?.includes(option)
                    ? c.options
                    : [...(c.options ?? []), option],
                }
              : c
          );
          return {
            pages: {
              ...s.pages,
              [pageId]: touch({
                ...page,
                database: { ...page.database, columns },
              }),
            },
          };
        }),
    }),
    {
      name: "potion-store",
      version: 1,
    }
  )
);
