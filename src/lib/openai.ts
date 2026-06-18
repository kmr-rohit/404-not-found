import OpenAI from "openai";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPTS = {
  summary: `You are a conference note assistant. Create a concise bullet-point summary of this talk transcript.
Focus on key themes, announcements, tools mentioned, and actionable insights. 5-8 bullets max.`,
  notes: `You are a conference attendee writing personal notes. From this transcript, write first-person notes
as if the listener is capturing takeaways for later. Include what stood out, questions to explore, and follow-ups.`,
  tweet: `Write a single engaging tweet (max 280 characters) about this talk. Include 2-3 relevant hashtags
like #KubeCon #CloudNative #Kubernetes. Make it punchy and insightful.`,
} as const;

export async function transcribeAudioBuffer(
  buffer: Buffer,
  filename = "chunk.webm",
) {
  const openai = getOpenAI();
  if (!openai) {
    return "[Demo mode] Audio transcribed — connect OPENAI_API_KEY for live transcription.";
  }

  const file = new File([new Uint8Array(buffer)], filename, { type: "audio/webm" });
  const result = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });

  return result.text.trim();
}

export async function generateTalkContent(
  type: keyof typeof PROMPTS,
  transcript: string,
  talkTitle: string,
) {
  if (!process.env.OPENAI_API_KEY) {
    return `[Demo mode] Generated ${type} for "${talkTitle}". Add OPENAI_API_KEY to enable AI output.`;
  }

  const { text } = await generateText({
    model: openaiProvider("gpt-4o-mini"),
    system: PROMPTS[type],
    prompt: `Talk title: ${talkTitle}\n\nTranscript:\n${transcript}`,
  });

  return text.trim();
}

export async function createRealtimeClientSecret() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "transcription",
        audio: {
          input: {
            transcription: {
              model: "gpt-4o-mini-transcribe",
              language: "en",
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Realtime token failed: ${error}`);
  }

  return response.json() as Promise<{ value: string }>;
}
