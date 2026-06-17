"use client";

import { useCallback, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { useStreamingRecorder } from "@/hooks/use-streaming-recorder";

export function AudioRecorder({
  talkId,
  initialTranscript,
  onSaved,
}: {
  talkId: string;
  initialTranscript: string;
  onSaved?: (transcript: string) => void;
}) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const persistTranscript = useCallback(
    async (text: string) => {
      setSaving(true);
      try {
        await fetch(`/api/talks/${talkId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });
        onSaved?.(text);
      } finally {
        setSaving(false);
      }
    },
    [talkId, onSaved],
  );

  const { status, error, liveText, isRecording, start, stop, setLiveText } =
    useStreamingRecorder({
      onTranscriptFinal: (delta) => {
        setTranscript((prev) => {
          const next = prev ? `${prev} ${delta}` : delta;
          void persistTranscript(next);
          return next;
        });
      },
    });

  const handleStop = () => {
    stop();
    const finalText = liveText || transcript;
    setTranscript(finalText);
    void persistTranscript(finalText);
    setStatusMessage("Recording stopped. Transcript saved.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Live transcription</h2>
          <p className="text-sm text-muted-foreground">
            Streams audio in real time. Falls back to chunked transcription if
            realtime is unavailable.
          </p>
        </div>
        {isRecording ? (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Mic className="h-4 w-4" />
            {status === "connecting" ? "Connecting..." : "Start recording"}
          </button>
        )}
      </div>

      {isRecording ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-accent">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          Listening… transcript updates as you speak
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      {statusMessage ? (
        <p className="mt-3 text-sm text-muted-foreground">{statusMessage}</p>
      ) : null}
      {saving ? (
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving transcript…
        </p>
      ) : null}

      <textarea
        value={liveText || transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          setLiveText(e.target.value);
        }}
        onBlur={() => persistTranscript(liveText || transcript)}
        rows={10}
        placeholder="Transcript appears here as you record. You can also edit manually."
        className="mt-4 w-full rounded-xl border border-border bg-background p-4 text-sm leading-relaxed outline-none ring-primary/30 focus:ring-2"
      />
    </div>
  );
}
