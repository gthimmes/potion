"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "@/store/useStore";
import type { Page } from "@/lib/types";
import Sidebar from "./Sidebar";
import PageView from "./PageView";
import QuickFind from "./QuickFind";

function seedWorkspace() {
  const state = useStore.getState();
  if (Object.keys(state.pages).length > 0) return;

  const gettingStartedId = nanoid();
  const tasksId = nanoid();

  const gettingStarted: Page = {
    id: gettingStartedId,
    title: "Getting Started",
    icon: "👋",
    cover: "slate",
    parentId: null,
    children: [],
    blocks: [
      { id: nanoid(), type: "h1", content: "Welcome to Potion" },
      {
        id: nanoid(),
        type: "text",
        content: "A better home for your notes, docs, and databases.",
      },
      { id: nanoid(), type: "h2", content: "The basics" },
      {
        id: nanoid(),
        type: "text",
        content: "Type '/' anywhere to insert any kind of block.",
      },
      { id: nanoid(), type: "todo", content: "Try checking me off", checked: false },
      {
        id: nanoid(),
        type: "todo",
        content: "Press Enter to add a new block below",
        checked: false,
      },
      { id: nanoid(), type: "bullet", content: "Use Markdown: type # for a heading" },
      { id: nanoid(), type: "bullet", content: "- for a bullet, [] for a to-do" },
      {
        id: nanoid(),
        type: "callout",
        content: "Tip: Everything is saved automatically in your browser.",
      },
      { id: nanoid(), type: "h2", content: "Databases" },
      {
        id: nanoid(),
        type: "text",
        content:
          "Create a database from the sidebar to track anything with Table and Board views.",
      },
      { id: nanoid(), type: "quote", content: "Your workspace, your rules." },
    ],
    isDatabase: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  useStore.setState({
    pages: { [gettingStartedId]: gettingStarted },
    rootOrder: [gettingStartedId],
    currentPageId: gettingStartedId,
  });

  // Second page: a tasks database, via the store action so structure stays valid.
  const dbId = useStore.getState().createPage(null, true);
  useStore.getState().setTitle(dbId, "Tasks");
  useStore.getState().setCurrentPage(gettingStartedId);
  // reference tasksId to avoid unused warning in some tooling
  void tasksId;
}

export default function Workspace() {
  const [mounted, setMounted] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const theme = useStore((s) => s.theme);
  const currentPageId = useStore((s) => s.currentPageId);

  useEffect(() => {
    seedWorkspace();
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFindOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!mounted) {
    return <div className="bg-app h-screen w-screen" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app">
      <Sidebar onOpenFind={() => setFindOpen(true)} />
      <main className="flex-1 overflow-y-auto">
        {currentPageId ? (
          <PageView pageId={currentPageId} />
        ) : (
          <div className="flex h-full items-center justify-center text-soft">
            Select or create a page to get started.
          </div>
        )}
      </main>
      {findOpen && <QuickFind onClose={() => setFindOpen(false)} />}
    </div>
  );
}
