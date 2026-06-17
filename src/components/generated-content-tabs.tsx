"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { GeneratedOutput } from "../../drizzle/schema";
import { Badge } from "./ui";

const TABS = [
  { id: "summary" as const, label: "Summary" },
  { id: "notes" as const, label: "Notes" },
  { id: "tweet" as const, label: "Tweet" },
];

export function GeneratedContentTabs({
  talkId,
  transcript,
  initialOutputs,
}: {
  talkId: string;
  transcript: string;
  initialOutputs: GeneratedOutput[];
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("summary");
  const [outputs, setOutputs] = useState(initialOutputs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current =
    [...outputs].reverse().find((o) => o.type === active)?.content ?? "";

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talkId, type: active, transcript }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Generation failed");
      }
      const data = (await res.json()) as { content: string; type: string };
      setOutputs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          talkId,
          type: data.type as GeneratedOutput["type"],
          content: data.content,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AI outputs</h2>
          <p className="text-sm text-muted-foreground">
            Generate summaries, personal notes, and tweet drafts from your
            transcript.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !transcript.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate {active}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

      <div className="mt-4 min-h-[160px] rounded-xl border border-border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {current || (
          <span className="text-muted-foreground">
            No {active} yet. Record a transcript, then hit generate.
          </span>
        )}
      </div>

      {outputs.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {outputs.map((output) => (
            <Badge key={output.id}>{output.type}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
