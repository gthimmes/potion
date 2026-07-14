# ⚗️ Potion

A local-first Notion competitor — block-based docs, nested pages, and databases with table & board views. Everything is saved automatically in your browser (localStorage), no account or backend required.

## Features

- **Block editor** — headings, text, to-dos, bulleted/numbered lists, quotes, callouts, code, and dividers.
- **Inline formatting** — select text for a floating toolbar: bold, italic, underline, strikethrough, inline code, and links.
- **@-mentions** — type `@` to link to any page inline; click the chip to jump to it.
- **Sub-page blocks** — `/page` embeds a real nested page inline; click to open it, and its title stays in sync everywhere.
- **Inline databases** — `/database` embeds a full table + board database right inside a page; open it as a full page anytime with ↗.
- **Image blocks** — embed by URL or upload from your device.
- **Drag to reorder** — grab the ⋮⋮ handle to reorder blocks.
- **Slash menu** — type `/` to insert any block; filter by name.
- **Markdown shortcuts** — `#`/`##`/`###` headings, `-` bullet, `1.` numbered, `[]` to-do, `>` quote, ` ``` ` code.
- **Keyboard-native** — Enter splits blocks, Backspace merges, arrow keys move between blocks.
- **Nested pages** — infinite page tree in the sidebar with expand/collapse, subpages, breadcrumbs.
- **Page styling** — emoji icons and gradient covers.
- **Databases** — Table and Board (Kanban) views. Column types: text, number, select (colored tags), date, checkbox. Drag cards between board columns. **Filter and sort** any view by any column.
- **Quick Find** — `⌘K` / `Ctrl+K` to search pages by title or content.
- **Dark mode**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Testing

Three layers, all runnable locally:

```bash
npm test         # unit + integration (Vitest + Testing Library, jsdom)
npm run test:e2e # end-to-end (Playwright, real Chromium)
```

- **Unit** — the Zustand store (every page/block/database action), the database
  filter/sort engine (`lib/dbQuery`), rich-text helpers, block commands, constants.
- **Integration** — components against the real store: `TableView`, `DatabaseView`
  (filter/sort UI), `Sidebar`, `QuickFind`.
- **End-to-end** — real-browser journeys Playwright can exercise that jsdom can't:
  markdown shortcuts, the slash menu, contentEditable editing, to-dos, sub-pages,
  database filtering, board view, and ⌘K quick find.

75 unit/integration specs + 9 e2e specs.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Zustand (persisted to localStorage).
Tested with Vitest, Testing Library, and Playwright.

## Project layout

```
src/
  app/                 # Next.js app shell
  components/          # Sidebar, PageView, Editor, Block, SlashMenu, QuickFind
    database/          # DatabaseView, TableView, BoardView, cells
  store/useStore.ts    # Zustand store — all state + actions, persisted
  lib/                 # types, block commands, constants
```

## Roadmap (not yet built)

Real-time collaboration, accounts/auth, sharing & permissions, and a public API.
