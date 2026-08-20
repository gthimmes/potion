"use client";

import { useEffect, useRef } from "react";
import { HelpNavigator } from "help-navigator";
import { useStore } from "@/store/useStore";
import { helpContent } from "@/help/content";
import { helpArticlesFor, workspaceViewOf } from "@/help/context";

// Mounts the in-app help center (floating launcher bottom-right, F1 to
// toggle) and keeps "Suggested for this page" in sync with what's on screen.
export default function HelpWidget() {
  const theme = useStore((s) => s.theme);
  const view = useStore((s) =>
    workspaceViewOf(s.currentPageId ? s.pages[s.currentPageId] : null)
  );
  const helpRef = useRef<HelpNavigator | null>(null);

  // The widget has no runtime theme setter, so re-init when the app theme
  // flips (cheap: it renders null and owns its own shadow-DOM UI).
  useEffect(() => {
    const help = HelpNavigator.init({
      content: helpContent,
      theme,
      accentColor: "#2383e2",
      position: "bottom-right",
      hotkey: "F1",
      texts: { panelTitle: "Potion Help" },
    });
    helpRef.current = help;
    return () => {
      helpRef.current = null;
      help.destroy();
    };
  }, [theme]);

  useEffect(() => {
    helpRef.current?.setContext(helpArticlesFor(view));
  }, [view, theme]); // theme too: a re-init needs the context re-applied

  return null;
}
