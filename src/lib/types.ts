export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "todo"
  | "bullet"
  | "numbered"
  | "quote"
  | "callout"
  | "code"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for todo
}

export type ColumnType = "text" | "number" | "select" | "date" | "checkbox";

export interface DbColumn {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[]; // for select
}

export interface DbRow {
  id: string;
  cells: Record<string, string>; // columnId -> value
}

export type ViewType = "table" | "board";

export interface DbView {
  id: string;
  name: string;
  type: ViewType;
  groupBy?: string; // columnId, for board
}

export interface Database {
  columns: DbColumn[];
  rows: DbRow[];
  views: DbView[];
  activeViewId: string;
}

export interface Page {
  id: string;
  title: string;
  icon: string; // emoji
  cover: string | null; // gradient key or url
  parentId: string | null;
  children: string[]; // ordered child page ids
  blocks: Block[];
  isDatabase: boolean;
  database?: Database;
  createdAt: number;
  updatedAt: number;
}

export type Theme = "light" | "dark";
