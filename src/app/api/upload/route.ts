import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { photos } from "../../../../drizzle/schema";
import { uploadImageToAppwrite } from "@/lib/appwrite";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const talkId = formData.get("talkId") as string | null;
    const caption = (formData.get("caption") as string | null) ?? "";

    if (!(file instanceof File) || !talkId) {
      return NextResponse.json({ error: "Missing file or talkId" }, { status: 400 });
    }

    const { fileId, imageUrl } = await uploadImageToAppwrite(file);
    const db = getDb();

    if (db) {
      const [row] = await db
        .insert(photos)
        .values({ talkId, fileId, imageUrl, caption })
        .returning();
      return NextResponse.json(row);
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      talkId,
      fileId,
      imageUrl,
      caption,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
