import { NextResponse } from "next/server";
import { createRealtimeClientSecret } from "@/lib/openai";

export async function POST() {
  try {
    const secret = await createRealtimeClientSecret();
    if (!secret) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 },
      );
    }
    return NextResponse.json(secret);
  } catch (error) {
    console.error("Realtime token error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token failed" },
      { status: 500 },
    );
  }
}
