"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group/row relative flex items-start"
    >
      {/* drag handle — only this element starts a drag, so text stays selectable */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-1 flex h-6 w-4 shrink-0 cursor-grab items-center justify-center rounded text-soft opacity-0 hover:bg-black/10 group-hover/row:opacity-60 active:cursor-grabbing dark:hover:bg-white/10"
        contentEditable={false}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
