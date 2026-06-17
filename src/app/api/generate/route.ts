import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generatedOutputs, talks } from "../../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { generateTalkContent } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      talkId: string;
      type: "summary" | "notes" | "tweet";
      transcript?: string;
      title?: string;
    };

    const { talkId, type, transcript, title } = body;
    if (!talkId || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    let talkTitle = title ?? "Conference talk";
    let talkTranscript = transcript ?? "";

    if (db) {
      const [talk] = await db.select().from(talks).where(eq(talks.id, talkId));
      if (talk) {
        talkTitle = talk.title;
        talkTranscript = talkTranscript || talk.transcript || "";
      }
    }

    if (!talkTranscript.trim()) {
      return NextResponse.json(
        { error: "No transcript available to generate from" },
        { status: 400 },
      );
    }

    const content = await generateTalkContent(type, talkTranscript, talkTitle);

    if (db) {
      await db.insert(generatedOutputs).values({ talkId, type, content });
    }

    return NextResponse.json({ content, type });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
