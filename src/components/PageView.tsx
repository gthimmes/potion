"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { COVER_GRADIENTS, COVER_KEYS, PAGE_EMOJIS } from "@/lib/constants";
import Editor from "./Editor";
import DatabaseView from "./database/DatabaseView";

function Breadcrumb({ pageId }: { pageId: string }) {
  const pages = useStore((s) => s.pages);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const trail: { id: string; title: string; icon: string }[] = [];
  let cursor: string | null = pageId;
  while (cursor && pages[cursor]) {
    trail.unshift({
      id: cursor,
      title: pages[cursor].title || "Untitled",
      icon: pages[cursor].icon,
    });
    cursor = pages[cursor].parentId;
  }
  return (
    <div className="flex items-center gap-1 px-14 py-2 text-sm text-soft">
      {trail.map((t, i) => (
        <span key={t.id} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">/</span>}
          <button
            onClick={() => setCurrentPage(t.id)}
            className="hover-app rounded px-1 py-0.5"
          >
            {t.icon} {t.title}
          </button>
        </span>
      ))}
    </div>
  );
}

function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="bg-elevated absolute z-50 mt-1 grid w-64 grid-cols-8 gap-1 rounded-lg border border-app bg-app p-2 shadow-xl">
        {PAGE_EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => {
              onPick(e);
              onClose();
            }}
            className="hover-app flex h-7 w-7 items-center justify-center rounded text-lg"
          >
            {e}
          </button>
        ))}
      </div>
    </>
  );
}

export default function PageView({ pageId }: { pageId: string }) {
  const page = useStore((s) => s.pages[pageId]);
  const setTitle = useStore((s) => s.setTitle);
  const setIcon = useStore((s) => s.setIcon);
  const setCover = useStore((s) => s.setCover);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [coverMenu, setCoverMenu] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  if (!page) return null;

  return (
    <div className="min-h-full pb-40" key={pageId}>
      <Breadcrumb pageId={pageId} />

      {/* Cover */}
      {page.cover && (
        <div
          className="group relative h-44 w-full"
          style={{ background: COVER_GRADIENTS[page.cover] ?? page.cover }}
        >
          <div className="absolute bottom-3 right-6 flex gap-2 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setCoverMenu((v) => !v)}
              className="rounded bg-black/30 px-2 py-1 text-xs text-white backdrop-blur"
            >
              Change cover
            </button>
            <button
              onClick={() => setCover(pageId, null)}
              className="rounded bg-black/30 px-2 py-1 text-xs text-white backdrop-blur"
            >
              Remove
            </button>
          </div>
          {coverMenu && (
            <div className="absolute bottom-11 right-6 z-50 flex gap-2 rounded-lg border border-app bg-app p-2 shadow-xl">
              {COVER_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setCover(pageId, k);
                    setCoverMenu(false);
                  }}
                  className="h-8 w-12 rounded"
                  style={{ background: COVER_GRADIENTS[k] }}
                  title={k}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-3xl px-14">
        {/* Icon */}
        <div className={page.cover ? "-mt-8" : "mt-10"}>
          <div className="relative inline-block">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="text-6xl leading-none hover:opacity-80"
            >
              {page.icon}
            </button>
            {pickerOpen && (
              <EmojiPicker
                onPick={(e) => setIcon(pageId, e)}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-2 flex gap-3 text-sm text-soft opacity-0 transition hover:opacity-100 [.group:hover_&]:opacity-100">
          {!page.cover && (
            <button
              onClick={() => setCover(pageId, COVER_KEYS[0])}
              className="hover-app rounded px-1"
            >
              🖼 Add cover
            </button>
          )}
        </div>

        {/* Title */}
        <textarea
          ref={titleRef}
          value={page.title}
          onChange={(e) => setTitle(pageId, e.target.value)}
          placeholder="Untitled"
          rows={1}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          className="mt-2 w-full resize-none bg-transparent text-4xl font-bold outline-none placeholder:text-soft placeholder:opacity-40"
        />

        {/* Body */}
        <div className="mt-3">
          {page.isDatabase ? (
            <DatabaseView pageId={pageId} />
          ) : (
            <Editor pageId={pageId} />
          )}
        </div>
      </div>
    </div>
  );
}
