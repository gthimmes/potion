import type { HelpContent } from "help-navigator";

// The in-app help corpus: categories + markdown articles, rendered by the
// help-navigator widget mounted in the root layout.
export const helpContent: HelpContent = {
  categories: [
    {
      id: "getting-started",
      title: "Getting started",
      icon: "👋",
      description: "What Potion is, where your data lives, and finding your way around.",
    },
    {
      id: "pages",
      title: "Pages & organization",
      icon: "📄",
      description: "The page tree, subpages, icons, covers, and breadcrumbs.",
    },
    {
      id: "blocks",
      title: "Blocks & editing",
      icon: "✏️",
      description: "The slash menu, markdown shortcuts, keyboard editing, and reordering.",
    },
    {
      id: "formatting",
      title: "Formatting & links",
      icon: "🎨",
      description: "Inline styles from the selection toolbar, links, and @-mentions.",
    },
    {
      id: "databases",
      title: "Databases",
      icon: "🗂️",
      description: "Tables and boards, column types, filtering, and sorting.",
    },
  ],
  articles: [
    // ---------- Getting started ----------
    {
      id: "welcome-tour",
      title: "Welcome to Potion",
      category: "getting-started",
      featured: true,
      tags: ["overview", "tour", "basics", "intro"],
      body: `Potion is a home for your notes, docs, and databases — built from three ideas:

1. **Pages** — documents that nest infinitely in the sidebar tree
2. **Blocks** — every page is a stack of blocks: text, headings, to-dos, lists, images, and more
3. **Databases** — structured pages with **Table** and **Board** views

## First steps

- The seeded **Getting Started** page walks the basics — try checking off its to-dos
- Type \`/\` inside any page to insert a block
- Press **Ctrl+K** (⌘K on Mac) to jump between pages
- Click **＋ New page** or **🗂️ New database** at the bottom of the sidebar

> Press **F1** anytime to open this help panel.`,
      related: ["local-first", "slash-menu", "create-pages"],
    },
    {
      id: "local-first",
      title: "Local-first: where your data lives",
      category: "getting-started",
      featured: true,
      tags: ["local", "storage", "autosave", "privacy", "offline", "save"],
      body: `Potion is **local-first**: your entire workspace is stored in your browser's localStorage. There is no account, no backend, and nothing leaves your machine.

## What that means in practice

- **Autosave is instant** — every edit is persisted as you type; there is no Save button
- **No sign-in** — open the app and start writing
- **Per-browser** — your workspace lives in *this* browser on *this* device; another browser or device starts fresh
- **Clearing site data clears your workspace** — wiping browser storage for this site deletes your pages, so be deliberate with browser cleanup tools

Images you upload are stored inside the page data too, so large images add up — prefer embedding by URL for big files.`,
      related: ["welcome-tour", "image-blocks"],
    },
    {
      id: "quick-find",
      title: "Quick Find: search your workspace",
      category: "getting-started",
      tags: ["search", "find", "ctrl+k", "cmd+k", "navigate"],
      body: `**Quick Find** searches every page — press **Ctrl+K** (⌘K), or click **🔍 Quick Find** at the top of the sidebar.

- Matches page **titles** and the **text inside blocks**
- With an empty query it lists your **most recently updated** pages
- **↑/↓** move through results, **Enter** opens the highlighted page, **Escape** closes

Quick Find is usually faster than digging through the sidebar tree once your workspace grows past a handful of pages.`,
      related: ["welcome-tour", "create-pages"],
    },
    {
      id: "dark-mode",
      title: "Dark mode and the sidebar",
      category: "getting-started",
      tags: ["dark", "theme", "sidebar", "collapse"],
      body: `## Dark mode

Toggle between light and dark with the **🌙 Dark mode / ☀️ Light mode** button at the bottom of the sidebar. The choice is saved with the rest of your workspace.

## The sidebar

The sidebar is your workspace's table of contents:

- **Workspace** section — the page tree; click **▶** to expand a page's subpages
- **«** collapses the sidebar to a thin rail for focused writing; **»** brings it back
- The footer holds **＋ New page**, **🗂️ New database**, and the theme toggle`,
      related: ["create-pages", "quick-find"],
    },

    // ---------- Pages & organization ----------
    {
      id: "create-pages",
      title: "Creating pages and subpages",
      category: "pages",
      featured: true,
      tags: ["pages", "new", "subpage", "nested", "tree"],
      body: `Pages nest without limit — a page can hold subpages, which hold their own subpages, and so on.

## Creating

- **＋ New page** (sidebar footer) — a new top-level page
- Hover a page in the sidebar and click **+** — a subpage under it
- Type \`/page\` inside a page — a **sub-page block** embedded right in the text

## The tree

Expand or collapse a page's children with the **▶** arrow next to its name. The page you're on is highlighted; click any page to open it.

Use nesting to give every project one page with everything underneath — notes, tasks, and databases all live in one branch of the tree.`,
      related: ["subpage-blocks", "breadcrumbs", "delete-pages"],
    },
    {
      id: "icons-covers",
      title: "Page icons and covers",
      category: "pages",
      tags: ["icon", "emoji", "cover", "gradient", "style"],
      body: `Give pages personality so they're recognizable at a glance.

## Icons

Every page has an emoji icon, shown in the sidebar, breadcrumbs, and at the top of the page. **Click the big emoji** above the title to pick a different one.

## Covers

A cover is a gradient banner across the top of the page:

- Hover below the icon and click **🖼 Add cover**
- Hover the cover and click **Change cover** to pick another gradient — sunset, ocean, grape, forest, ember, or slate
- **Remove** takes it away again`,
      related: ["create-pages", "breadcrumbs"],
    },
    {
      id: "breadcrumbs",
      title: "Breadcrumbs and navigating nesting",
      category: "pages",
      tags: ["breadcrumbs", "navigation", "parent", "trail"],
      body: `Deep nesting stays navigable because every page shows its full **breadcrumb trail** at the top — the chain of parent pages from the workspace root down to where you are.

Click any crumb to jump straight to that ancestor.

Combined with the sidebar tree and Quick Find, you always have three ways back to anything:

1. **Breadcrumbs** — up the current branch
2. **Sidebar** — the whole tree at once
3. **Ctrl+K** — straight to a page by name or content`,
      related: ["create-pages", "quick-find"],
    },
    {
      id: "delete-pages",
      title: "Deleting pages",
      category: "pages",
      tags: ["delete", "remove", "trash"],
      body: `Hover a page in the sidebar and click **🗑** to delete it. Potion asks you to confirm first, because deletion is real:

- The page and **all of its subpages** are removed
- Potion is local-first, so there is no server-side copy or trash can to restore from

If a page might matter later, move its content into another page (or just leave it collapsed in the tree) rather than deleting it.`,
      related: ["create-pages", "local-first"],
    },

    // ---------- Blocks & editing ----------
    {
      id: "slash-menu",
      title: "The slash menu: every block type",
      category: "blocks",
      featured: true,
      tags: ["slash", "insert", "blocks", "menu", "types"],
      body: `Type \`/\` in any empty spot of a page to open the **slash menu**, then keep typing to filter by name. Blocks you can insert:

- **Text** — a plain paragraph
- **Page** — an embedded sub-page
- **Database** — an inline table & board
- **Heading 1 / 2 / 3** — section headings
- **To-do** — a checkbox task
- **Bulleted / Numbered list** — list items
- **Quote** — set a line apart
- **Callout** — highlighted note box
- **Code** — monospaced snippet
- **Image** — upload or embed by URL
- **Divider** — a horizontal rule

Pick with the arrow keys and **Enter**, or click. Most text-like blocks can also be created faster with markdown shortcuts.`,
      related: ["markdown-shortcuts", "keyboard-editing", "subpage-blocks"],
    },
    {
      id: "markdown-shortcuts",
      title: "Markdown shortcuts",
      category: "blocks",
      tags: ["markdown", "shortcuts", "heading", "list", "todo"],
      body: `Start a block with a markdown token and press **space** — the block converts instantly:

- \`#\`, \`##\`, \`###\` — Heading 1, 2, 3
- \`-\` or \`*\` — bulleted list
- \`1.\` — numbered list
- \`[]\` — to-do
- \`>\` — quote
- three backticks — code block

Muscle memory from any markdown editor carries straight over — heading, dash, bracket-bracket, go.`,
      related: ["slash-menu", "keyboard-editing"],
    },
    {
      id: "keyboard-editing",
      title: "Keyboard-native editing",
      category: "blocks",
      tags: ["keyboard", "enter", "backspace", "arrows", "split", "merge"],
      body: `The editor is built to keep your hands on the keyboard:

- **Enter** — splits the current block; text after the cursor moves into a new block below (**Shift+Enter** for a plain line break)
- **Backspace** at the start of a block — merges it into the block above; on an empty block it deletes it
- **↑ / ↓** at the edges of a block — move the cursor between blocks
- **Escape** — closes an open slash or mention menu

New to-do, bullet, and numbered blocks continue their kind when you press Enter, so lists grow naturally.`,
      related: ["markdown-shortcuts", "slash-menu", "reorder-blocks"],
    },
    {
      id: "reorder-blocks",
      title: "Reordering blocks by drag",
      category: "blocks",
      tags: ["drag", "reorder", "move", "handle"],
      body: `Every block has a **⋮⋮ drag handle** that appears on the left when you hover it.

Grab the handle and drag the block to a new spot — the page reflows as you go, and the new order is saved automatically like every other edit.

Reordering works for every block type, including images, callouts, embedded sub-pages, and inline databases.`,
      related: ["keyboard-editing", "slash-menu"],
    },
    {
      id: "image-blocks",
      title: "Image blocks",
      category: "blocks",
      tags: ["image", "photo", "upload", "embed", "url"],
      body: `Insert an image with \`/image\`, then either:

- **Paste a URL** and press Enter to embed it, or
- **Upload** a file from your device

Hover an image for **Replace** (swap it out) and **Remove** (delete the block).

## A note on uploads

Uploaded files are stored *inside your page data* in the browser (as a data URL) — convenient and fully offline, but large images grow your workspace quickly. For big photos, embedding by URL keeps things light.`,
      related: ["slash-menu", "local-first"],
    },
    {
      id: "subpage-blocks",
      title: "Sub-page blocks and inline databases",
      category: "blocks",
      tags: ["subpage", "embed", "inline", "database", "page block"],
      body: `Two block types embed *whole pages* inside the one you're writing:

## Sub-page blocks — \`/page\`

Creates a real nested page and shows it as a block. Click it to open the page; its title stays in sync everywhere it appears.

## Inline databases — \`/database\`

Embeds a full database — view tabs, filters, table, board — right in the middle of your document. Rename it inline, edit rows in place, and click **↗** to open it as a full page when you want more room.

Both are actual pages in your tree, not copies — there's one source of truth however you reach it.`,
      related: ["create-pages", "database-basics", "slash-menu"],
    },

    // ---------- Formatting & links ----------
    {
      id: "inline-formatting",
      title: "Inline formatting with the selection toolbar",
      category: "formatting",
      featured: true,
      tags: ["bold", "italic", "underline", "strikethrough", "code", "link", "toolbar"],
      body: `Select any text inside a block and a **floating toolbar** appears with:

- **Bold**, *italic*, underline, and strikethrough
- \`inline code\` — for identifiers and commands
- **Link** — enter a URL and press Enter to apply it

Formats combine freely, and everything is stored with the block, so styled text survives splits, merges, and drags like any other content.`,
      related: ["mentions", "keyboard-editing"],
    },
    {
      id: "mentions",
      title: "@-mentions: link to any page",
      category: "formatting",
      tags: ["mention", "@", "link", "reference", "chip"],
      body: `Type **@** while writing and a menu of your pages appears — keep typing to filter, then pick one.

The mention becomes an inline **chip** showing the page's icon and title. Click the chip to jump to that page.

Mentions are how you weave a wiki out of your notes: meeting notes that point at the project page, a project page that points at its spec. Unlike copied titles, a chip always refers to the *actual* page.`,
      related: ["inline-formatting", "subpage-blocks", "quick-find"],
    },

    // ---------- Databases ----------
    {
      id: "database-basics",
      title: "Databases: tables and boards in one",
      category: "databases",
      featured: true,
      tags: ["database", "table", "board", "views", "new"],
      body: `A database is a page whose content is **structured rows** instead of free-form blocks.

## Creating one

- **🗂️ New database** in the sidebar footer — a full-page database
- \`/database\` inside any page — an inline one

New databases start ready to use: a **Name** column, a **Status** select column (*Not started / In progress / Done*), a few sample rows, and two views — **Table** and a **Board** grouped by Status.

## Views

Tabs above the data switch between **▦ Table** and **🗂 Board**. Each view keeps its own filters and sorts, so "everything, sorted" and "just what's in progress" can live side by side over the same rows.`,
      related: ["column-types", "table-view", "board-view", "filter-sort"],
    },
    {
      id: "column-types",
      title: "Column types",
      category: "databases",
      tags: ["columns", "types", "select", "number", "date", "checkbox", "properties"],
      body: `Each column has a type that shapes how its cells are edited, colored, filtered, and sorted:

- **Text** — free-form strings
- **Number** — numeric input; sorts and filters numerically
- **Select** — one option per cell, shown as a **colored tag**; each option keeps a consistent color everywhere it appears
- **Date** — a date picker; filters support *before* and *after*
- **Checkbox** — on/off

Add a column from the table's rightmost **+**, picking its type as you create it. Columns can be renamed or deleted later; a select column's options grow as you add new values.

A board view needs at least one **select** column — that's what its columns group by.`,
      related: ["table-view", "board-view", "filter-sort"],
    },
    {
      id: "table-view",
      title: "Working in Table view",
      category: "databases",
      tags: ["table", "rows", "cells", "edit", "grid"],
      body: `Table view is the spreadsheet-like grid — every row and every column at once.

- **Edit any cell in place** — click and type; changes save as you go
- **＋ New** below the last row adds a row
- **＋** at the right end of the header adds a column — pick its type from the *New property* menu
- Rename a column by typing in its header; the **⋯** menu holds *Delete property*
- Hover a row and click **🗑** to delete it

Table view is where structure gets built and bulk edits happen; switch to the board when you want to *work* the items by status.`,
      related: ["database-basics", "column-types", "filter-sort"],
    },
    {
      id: "board-view",
      title: "Working in Board view",
      category: "databases",
      tags: ["board", "kanban", "cards", "drag", "group", "status"],
      body: `Board view is a kanban: one column per option of the grouping **select** column, plus a **"No …"** column for rows without a value.

- **Drag a card** to another column to change its value — dropping a task on *Done* sets Status to Done
- Each column shows a **count** of its cards
- Cards show the row's name and its other cell values, editable right on the card

If the board says *"Add a Select property to group this board"*, the database has no select column yet — add one in Table view first.`,
      related: ["database-basics", "column-types", "table-view"],
    },
    {
      id: "filter-sort",
      title: "Filtering and sorting views",
      category: "databases",
      tags: ["filter", "sort", "query", "where", "order"],
      body: `Every view has its own **Filter** and **Sort** controls in the bar above the data.

## Filters

Add a filter, pick a column, an operator, and a value. Operators match the column type — *contains* for text, *=, ≠, >, <* for numbers, *before/after* for dates, *checked/unchecked* for checkboxes, plus *is empty / is not empty* everywhere. Multiple filters combine, narrowing the rows further.

## Sorts

Sort by any column, **ascending or descending**, and stack multiple sorts — the second breaks ties in the first.

Filters and sorts are **saved per view**: build a "Board, only In progress" view once and it greets you that way every time.`,
      related: ["database-basics", "table-view", "board-view"],
    },
  ],
};
