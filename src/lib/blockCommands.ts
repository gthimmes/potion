import type { BlockType } from "./types";

export interface BlockCommand {
  type: BlockType;
  label: string;
  desc: string;
  icon: string;
  keywords: string[];
}

export const BLOCK_COMMANDS: BlockCommand[] = [
  { type: "text", label: "Text", desc: "Plain paragraph", icon: "¶", keywords: ["text", "paragraph", "plain"] },
  { type: "page", label: "Page", desc: "Embed a sub-page inside this page", icon: "📄", keywords: ["page", "subpage", "sub-page", "nested"] },
  { type: "h1", label: "Heading 1", desc: "Big section heading", icon: "H₁", keywords: ["h1", "heading", "title", "big"] },
  { type: "h2", label: "Heading 2", desc: "Medium heading", icon: "H₂", keywords: ["h2", "heading", "subtitle"] },
  { type: "h3", label: "Heading 3", desc: "Small heading", icon: "H₃", keywords: ["h3", "heading", "small"] },
  { type: "todo", label: "To-do", desc: "Checkbox task", icon: "☑", keywords: ["todo", "task", "checkbox", "check"] },
  { type: "bullet", label: "Bulleted list", desc: "Simple bullet list", icon: "•", keywords: ["bullet", "list", "unordered"] },
  { type: "numbered", label: "Numbered list", desc: "Ordered list", icon: "1.", keywords: ["numbered", "ordered", "list"] },
  { type: "quote", label: "Quote", desc: "Capture a quote", icon: "❝", keywords: ["quote", "blockquote"] },
  { type: "callout", label: "Callout", desc: "Make text stand out", icon: "💡", keywords: ["callout", "note", "info"] },
  { type: "code", label: "Code", desc: "Code snippet", icon: "</>", keywords: ["code", "snippet", "mono"] },
  { type: "image", label: "Image", desc: "Upload or embed an image", icon: "🖼", keywords: ["image", "photo", "picture", "img", "upload"] },
  { type: "divider", label: "Divider", desc: "Visual separator", icon: "—", keywords: ["divider", "line", "separator", "hr"] },
];

export function filterCommands(query: string): BlockCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCK_COMMANDS;
  return BLOCK_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  );
}

// Markdown-style shortcut: leading token -> block type.
export function markdownShortcut(text: string): BlockType | null {
  switch (text) {
    case "#":
      return "h1";
    case "##":
      return "h2";
    case "###":
      return "h3";
    case "-":
    case "*":
      return "bullet";
    case "1.":
      return "numbered";
    case "[]":
    case "[ ]":
      return "todo";
    case ">":
      return "quote";
    case "```":
      return "code";
    default:
      return null;
  }
}
