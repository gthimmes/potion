"use client";

import dynamic from "next/dynamic";

// Workspace touches localStorage-backed state; render client-only.
const Workspace = dynamic(() => import("@/components/Workspace"), {
  ssr: false,
});

export default function Home() {
  return <Workspace />;
}
