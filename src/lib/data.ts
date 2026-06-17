import { desc, eq } from "drizzle-orm";
import {
  conferences,
  generatedOutputs,
  photos,
  talks,
} from "../../drizzle/schema";
import { getDb } from "./db";
import {
  MOCK_CONFERENCE,
  MOCK_OUTPUTS,
  MOCK_PHOTOS,
  MOCK_TALKS,
} from "./mock-data";

export async function getConferences() {
  const db = getDb();
  if (!db) return [MOCK_CONFERENCE];
  return db.select().from(conferences).orderBy(desc(conferences.startDate));
}

export async function getConference(id: string) {
  const db = getDb();
  if (!db) {
    if (id === MOCK_CONFERENCE.id) return MOCK_CONFERENCE;
    return null;
  }
  const [row] = await db
    .select()
    .from(conferences)
    .where(eq(conferences.id, id));
  return row ?? null;
}

export async function getTalksByConference(conferenceId: string, query?: string) {
  const db = getDb();
  if (!db) {
    let rows = MOCK_TALKS.filter((t) => t.conferenceId === conferenceId);
    if (query?.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.speaker?.toLowerCase().includes(q) ||
          t.track?.toLowerCase().includes(q),
      );
    }
    return rows;
  }

  if (query?.trim()) {
    const pattern = `%${query.trim()}%`;
    const rows = await db.select().from(talks).where(eq(talks.conferenceId, conferenceId));
    return rows
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query.trim().toLowerCase()) ||
          t.speaker?.toLowerCase().includes(query.trim().toLowerCase()) ||
          t.track?.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        const aTime = a.scheduledAt?.getTime() ?? 0;
        const bTime = b.scheduledAt?.getTime() ?? 0;
        return aTime - bTime;
      });
  }

  return db
    .select()
    .from(talks)
    .where(eq(talks.conferenceId, conferenceId))
    .orderBy(talks.scheduledAt);
}

export async function getTalk(id: string) {
  const db = getDb();
  if (!db) return MOCK_TALKS.find((t) => t.id === id) ?? null;
  const [row] = await db.select().from(talks).where(eq(talks.id, id));
  return row ?? null;
}

export async function getTalkPhotos(talkId: string) {
  const db = getDb();
  if (!db) return MOCK_PHOTOS.filter((p) => p.talkId === talkId);
  return db.select().from(photos).where(eq(photos.talkId, talkId));
}

export async function getTalkOutputs(talkId: string) {
  const db = getDb();
  if (!db) return MOCK_OUTPUTS.filter((o) => o.talkId === talkId);
  return db
    .select()
    .from(generatedOutputs)
    .where(eq(generatedOutputs.talkId, talkId));
}

export async function getDashboardStats(conferenceId: string) {
  const talkRows = await getTalksByConference(conferenceId);
  const withTranscript = talkRows.filter((t) => t.transcript?.trim()).length;
  const photoCount = (
    await Promise.all(talkRows.map((t) => getTalkPhotos(t.id)))
  ).flat().length;
  const outputCount = (
    await Promise.all(talkRows.map((t) => getTalkOutputs(t.id)))
  ).flat().length;

  return {
    totalTalks: talkRows.length,
    recordedTalks: withTranscript,
    photoCount,
    outputCount,
  };
}
