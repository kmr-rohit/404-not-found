import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import {
  getConferences,
  getDashboardStats,
  getTalksByConference,
} from "@/lib/data";
import { formatTalkTime } from "@/lib/utils";
import { StatCard } from "@/components/ui";

export default async function DashboardPage() {
  const conferences = await getConferences();
  const conference = conferences[0];

  if (!conference) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">No conferences yet.</p>
      </div>
    );
  }

  const stats = await getDashboardStats(conference.id);
  const talks = await getTalksByConference(conference.id);
  const upcoming = talks.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Conference dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{conference.name}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {conference.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatTalkTime(conference.startDate)} – {formatTalkTime(conference.endDate)}
          </span>
        </div>
        <Link
          href={`/conferences/${conference.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Open talk board
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Talks tracked" value={stats.totalTalks} />
        <StatCard label="Recorded" value={stats.recordedTalks} hint="With transcript" />
        <StatCard label="Photos" value={stats.photoCount} />
        <StatCard label="AI outputs" value={stats.outputCount} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming / recent talks</h2>
          <Link
            href={`/conferences/${conference.id}`}
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {upcoming.map((talk) => (
            <Link
              key={talk.id}
              href={`/talks/${talk.id}`}
              className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{talk.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {talk.speaker} · {talk.track}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTalkTime(talk.scheduledAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
