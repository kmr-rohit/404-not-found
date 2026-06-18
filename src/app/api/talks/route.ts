import { NextRequest, NextResponse } from "next/server";
import { talks } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      conferenceId: string;
      title: string;
      speaker?: string;
      track?: string;
      scheduledAt?: string;
    };

    if (!body.conferenceId || !body.title?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        ...body,
        transcript: "",
        createdAt: new Date().toISOString(),
        demo: true,
      });
    }

    const [row] = await db
      .insert(talks)
      .values({
        conferenceId: body.conferenceId,
        title: body.title.trim(),
        speaker: body.speaker?.trim() || null,
        track: body.track?.trim() || null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      })
      .returning();

    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 500 },
    );
  }
}
