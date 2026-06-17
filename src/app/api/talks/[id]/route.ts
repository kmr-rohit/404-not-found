import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { talks } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { transcript?: string };

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        id,
        transcript: body.transcript ?? "",
        updated: true,
        demo: true,
      });
    }

    const [row] = await db
      .update(talks)
      .set({ transcript: body.transcript ?? "" })
      .where(eq(talks.id, id))
      .returning();

    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 },
    );
  }
}
