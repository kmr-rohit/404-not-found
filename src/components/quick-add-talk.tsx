"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function QuickAddTalk({ conferenceId }: { conferenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [track, setTrack] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/talks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId, title, speaker, track }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/talks/${data.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setOpen(false);
      setTitle("");
      setSpeaker("");
      setTrack("");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        <Plus className="h-4 w-4" />
        Quick add talk
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:w-auto sm:min-w-[320px]"
    >
      <p className="mb-3 text-sm font-medium">Add a talk</p>
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Talk title"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          required
        />
        <input
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Speaker"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          placeholder="Track"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
