import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioBuffer } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const text = await transcribeAudioBuffer(buffer, audio.name);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 },
    );
  }
}
