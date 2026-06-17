import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getConference,
  getTalk,
  getTalkOutputs,
  getTalkPhotos,
} from "@/lib/data";
import { formatTalkTime } from "@/lib/utils";
import { TalkCapture } from "@/components/talk-capture";
import { Badge } from "@/components/ui";

export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const talk = await getTalk(id);
  if (!talk) notFound();

  const conference = await getConference(talk.conferenceId);
  const photos = await getTalkPhotos(talk.id);
  const outputs = await getTalkOutputs(talk.id);

  return (
    <div className="space-y-6">
      <Link
        href={`/conferences/${talk.conferenceId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {conference?.name ?? "conference"}
      </Link>

      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {talk.track ? <Badge>{talk.track}</Badge> : null}
          <Badge>{formatTalkTime(talk.scheduledAt)}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{talk.title}</h1>
        {talk.speaker ? (
          <p className="mt-2 text-lg text-muted-foreground">{talk.speaker}</p>
        ) : null}
      </div>

      <TalkCapture talk={talk} photos={photos} outputs={outputs} />
    </div>
  );
}
