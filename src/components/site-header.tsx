"use client";

import Link from "next/link";
import { Mic, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic className="h-4 w-4" />
          </span>
          <span>
            Session<span className="text-primary">Scribe</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
