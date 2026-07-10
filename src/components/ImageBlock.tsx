"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import type { Block as BlockT } from "@/lib/types";

export default function ImageBlock({
  pageId,
  block,
}: {
  pageId: string;
  block: BlockT;
}) {
  const updateBlock = useStore((s) => s.updateBlock);
  const deleteBlock = useStore((s) => s.deleteBlock);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateBlock(pageId, block.id, String(reader.result));
    reader.readAsDataURL(file);
  };

  if (block.content) {
    return (
      <div className="group relative my-1 inline-block max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.content}
          alt=""
          className="max-h-[70vh] max-w-full rounded-md"
        />
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => updateBlock(pageId, block.id, "")}
            className="rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur"
          >
            Replace
          </button>
          <button
            onClick={() => deleteBlock(pageId, block.id)}
            className="rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-1 rounded-md bg-black/[0.04] p-4 dark:bg-white/[0.04]">
      <div className="mb-3 flex items-center gap-2 text-sm text-soft">
        🖼 Add an image
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              updateBlock(pageId, block.id, url.trim());
            }
          }}
          placeholder="Paste an image URL and press Enter"
          className="min-w-0 flex-1 rounded border border-app bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded bg-black/10 px-3 py-1.5 text-sm dark:bg-white/10"
        >
          Upload
        </button>
        <button
          onClick={() => deleteBlock(pageId, block.id)}
          className="px-2 py-1.5 text-sm text-soft"
        >
          Remove
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
