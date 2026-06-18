"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GeneratedOutput, Photo, Talk } from "../../drizzle/schema";
import { TalkCard } from "./talk-card";
import { QuickAddTalk } from "./quick-add-talk";

export function TalkGrid({
  conferenceId,
  talks,
  photosByTalk,
  outputsByTalk,
}: {
  conferenceId: string;
  talks: Talk[];
  photosByTalk: Record<string, Photo[]>;
  outputsByTalk: Record<string, GeneratedOutput[]>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return talks;
    return talks.filter(
      (talk) =>
        talk.title.toLowerCase().includes(q) ||
        talk.speaker?.toLowerCase().includes(q) ||
        talk.track?.toLowerCase().includes(q),
    );
  }, [query, talks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search talks, speakers, tracks..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <QuickAddTalk conferenceId={conferenceId} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No talks match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((talk) => (
            <TalkCard
              key={talk.id}
              talk={talk}
              photos={photosByTalk[talk.id] ?? []}
              outputs={outputsByTalk[talk.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
