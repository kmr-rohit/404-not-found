import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getConference,
  getTalkOutputs,
  getTalkPhotos,
  getTalksByConference,
} from "@/lib/data";
import { TalkGrid } from "@/components/talk-grid";
import { notFound } from "next/navigation";

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conference = await getConference(id);
  if (!conference) notFound();

  const talks = await getTalksByConference(id);
  const photosByTalk: Record<string, Awaited<ReturnType<typeof getTalkPhotos>>> = {};
  const outputsByTalk: Record<string, Awaited<ReturnType<typeof getTalkOutputs>>> = {};

  await Promise.all(
    talks.map(async (talk) => {
      photosByTalk[talk.id] = await getTalkPhotos(talk.id);
      outputsByTalk[talk.id] = await getTalkOutputs(talk.id);
    }),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{conference.name}</h1>
        <p className="mt-1 text-muted-foreground">{conference.location}</p>
      </div>

      <TalkGrid
        conferenceId={conference.id}
        talks={talks}
        photosByTalk={photosByTalk}
        outputsByTalk={outputsByTalk}
      />
    </div>
  );
}
