import { describe, expect, it } from "vitest";
import { ContentStore, createSearchIndex, renderMarkdown } from "help-navigator";
import { helpContent } from "./content";
import {
  allMappedArticleIds,
  helpArticlesFor,
  workspaceViewOf,
  type WorkspaceView,
} from "./context";

describe("help content integrity", () => {
  const articleIds = new Set(helpContent.articles.map((a) => a.id));
  const categoryIds = new Set((helpContent.categories ?? []).map((c) => c.id));

  it("has unique article and category ids", () => {
    expect(articleIds.size).toBe(helpContent.articles.length);
    expect(categoryIds.size).toBe(helpContent.categories?.length);
  });

  it("every article belongs to a declared category", () => {
    for (const a of helpContent.articles) {
      expect(
        categoryIds.has(a.category ?? ""),
        `"${a.id}" has bad category "${a.category}"`
      ).toBe(true);
    }
  });

  it("every declared category has at least one article", () => {
    for (const c of helpContent.categories ?? []) {
      expect(
        helpContent.articles.some((a) => a.category === c.id),
        `category "${c.id}" is empty`
      ).toBe(true);
    }
  });

  it("every related id resolves and never self-references", () => {
    for (const a of helpContent.articles) {
      for (const rel of a.related ?? []) {
        expect(articleIds.has(rel), `"${a.id}" relates to unknown "${rel}"`).toBe(true);
        expect(rel).not.toBe(a.id);
      }
    }
  });

  it("bodies are substantive and render to HTML", () => {
    for (const a of helpContent.articles) {
      expect(a.body.trim().length, `"${a.id}" body too short`).toBeGreaterThan(100);
      expect(renderMarkdown(a.body).length).toBeGreaterThan(0);
    }
  });

  it("has featured articles for the help home view", () => {
    expect(helpContent.articles.filter((a) => a.featured).length).toBeGreaterThanOrEqual(4);
  });

  it("loads into a ContentStore without errors", () => {
    const store = new ContentStore(helpContent);
    expect(store.articles.length).toBe(helpContent.articles.length);
  });
});

describe("workspace view context map", () => {
  const articleIds = new Set(helpContent.articles.map((a) => a.id));

  it("every mapped article id exists in the content", () => {
    for (const id of allMappedArticleIds()) {
      expect(articleIds.has(id), `context map references unknown article "${id}"`).toBe(true);
    }
  });

  it("covers every workspace view with curated context", () => {
    const views: WorkspaceView[] = ["empty", "document", "database"];
    for (const view of views) {
      const articles = helpArticlesFor(view);
      expect(articles.length, `view ${view} has no help context`).toBeGreaterThan(0);
    }
  });

  it("derives the view from the current page", () => {
    expect(workspaceViewOf(null)).toBe("empty");
    expect(workspaceViewOf(undefined)).toBe("empty");
    expect(workspaceViewOf({ isDatabase: false })).toBe("document");
    expect(workspaceViewOf({ isDatabase: true })).toBe("database");
  });

  it("document pages get editor help; database pages get database help", () => {
    expect(helpArticlesFor("document")).toContain("slash-menu");
    expect(helpArticlesFor("document")).toContain("markdown-shortcuts");
    expect(helpArticlesFor("database")).toContain("database-basics");
    expect(helpArticlesFor("database")).toContain("filter-sort");
  });

  it("unknown views fall back to the welcome tour", () => {
    expect(helpArticlesFor("nope")).toEqual(["welcome-tour"]);
  });
});

describe("help search over the real corpus", () => {
  const index = createSearchIndex(
    helpContent.articles.map((a) => ({ id: a.id, title: a.title, body: a.body, tags: a.tags }))
  );

  const expectations: Array<[string, string]> = [
    ["slash", "slash-menu"],
    ["markdown", "markdown-shortcuts"],
    ["kanban", "board-view"],
    ["filter", "filter-sort"],
    ["autosave", "local-first"],
    ["mention", "mentions"],
    ["cover", "icons-covers"],
    ["breadcrumb", "breadcrumbs"],
    ["drag handle", "reorder-blocks"],
    ["upload", "image-blocks"],
    ["quick find", "quick-find"],
    ["dark mode", "dark-mode"],
  ];

  for (const [query, expectedId] of expectations) {
    it(`"${query}" surfaces ${expectedId} near the top`, () => {
      const top = index.search(query, 3).map((r) => r.id);
      expect(top, `query "${query}" returned ${JSON.stringify(top)}`).toContain(expectedId);
    });
  }
});
