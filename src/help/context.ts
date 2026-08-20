// Maps what's on screen to the help articles most relevant there — surfaced
// as "Suggested for this page" when the help panel opens.
//
// Potion is a single-route app (everything lives at "/", navigation happens in
// the store), so context is keyed on the current workspace view rather than
// the URL: no page selected, a document page, or a database page.

import type { Page } from "@/lib/types";

export type WorkspaceView = "empty" | "document" | "database";

const VIEW_HELP: Record<WorkspaceView, string[]> = {
  empty: ["welcome-tour", "create-pages", "quick-find"],
  document: ["slash-menu", "markdown-shortcuts", "inline-formatting", "reorder-blocks"],
  database: ["database-basics", "filter-sort", "board-view", "column-types"],
};

const FALLBACK = ["welcome-tour"];

/** The workspace view a (possibly absent) current page represents. */
export function workspaceViewOf(page: Pick<Page, "isDatabase"> | null | undefined): WorkspaceView {
  if (!page) return "empty";
  return page.isDatabase ? "database" : "document";
}

export function helpArticlesFor(view: WorkspaceView | string): string[] {
  return VIEW_HELP[view as WorkspaceView] ?? FALLBACK;
}

// Exported for tests: every article id referenced by the map.
export function allMappedArticleIds(): string[] {
  return [...new Set([...Object.values(VIEW_HELP).flat(), ...FALLBACK])];
}
