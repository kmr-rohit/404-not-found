import Link from "next/link";
import { Camera, FileText, Mic } from "lucide-react";
import type { GeneratedOutput, Photo, Talk } from "../../drizzle/schema";
import { formatTalkTime } from "@/lib/utils";
import { Badge } from "./ui";

export function TalkCard({
  talk,
  photos,
  outputs,
}: {
  talk: Talk;
  photos: Photo[];
  outputs: GeneratedOutput[];
}) {
  const hasTranscript = Boolean(talk.transcript?.trim());
  const hasPhotos = photos.length > 0;
  const hasOutputs = outputs.length > 0;

  return (
    <Link
      href={`/talks/${talk.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {talk.track ? <Badge>{talk.track}</Badge> : null}
        {hasTranscript ? (
          <Badge className="bg-primary/10 text-primary">Recorded</Badge>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold leading-snug text-card-foreground group-hover:text-primary">
        {talk.title}
      </h3>

      {talk.speaker ? (
        <p className="mt-2 text-sm text-muted-foreground">{talk.speaker}</p>
      ) : null}

      <p className="mt-1 text-xs text-muted-foreground">
        {formatTalkTime(talk.scheduledAt)}
      </p>

      {hasTranscript ? (
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {talk.transcript}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-muted-foreground">
          Tap to start capturing this session
        </p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Mic className="h-3.5 w-3.5" />
          {hasTranscript ? "Yes" : "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Camera className="h-3.5 w-3.5" />
          {hasPhotos ? photos.length : "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {hasOutputs ? outputs.length : "—"}
        </span>
      </div>
    </Link>
  );
}
