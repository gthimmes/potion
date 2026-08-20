import type { Metadata } from "next";
import "./globals.css";
import HelpWidget from "@/components/HelpWidget";

export const metadata: Metadata = {
  title: "Potion",
  description: "A better place for your notes, docs, and databases.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <HelpWidget />
      </body>
    </html>
  );
}
