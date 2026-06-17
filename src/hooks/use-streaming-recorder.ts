"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "recording" | "error";

interface UseStreamingRecorderOptions {
  onTranscriptDelta?: (delta: string) => void;
  onTranscriptFinal?: (text: string) => void;
  chunkIntervalMs?: number;
}

export function useStreamingRecorder({
  onTranscriptDelta,
  onTranscriptFinal,
  chunkIntervalMs = 4000,
}: UseStreamingRecorderOptions = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [liveText, setLiveText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIndexRef = useRef(0);
  const useRealtimeRef = useRef(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const cleanup = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    chunkIndexRef.current = 0;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const transcribeChunk = useCallback(
    async (blob: Blob) => {
      const formData = new FormData();
      formData.append("audio", blob, `chunk-${chunkIndexRef.current}.webm`);
      chunkIndexRef.current += 1;

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Transcription failed");
      }

      const data = (await response.json()) as { text: string };
      if (!data.text) return;

      setLiveText((prev) => {
        const next = prev ? `${prev} ${data.text}` : data.text;
        onTranscriptFinal?.(data.text);
        return next;
      });
      onTranscriptDelta?.(data.text);
    },
    [onTranscriptDelta, onTranscriptFinal],
  );

  const startChunkedRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = async (event) => {
      if (event.data.size < 1000) return;
      try {
        await transcribeChunk(event.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chunk failed");
      }
    };

    recorder.start(chunkIntervalMs);
    setStatus("recording");
  }, [chunkIntervalMs, transcribeChunk]);

  const startRealtimeRecording = useCallback(async () => {
    const tokenRes = await fetch("/api/realtime/token", { method: "POST" });
    if (!tokenRes.ok) throw new Error("Realtime unavailable");

    const { value: ephemeralKey } = (await tokenRes.json()) as {
      value: string;
    };

    const pc = new RTCPeerConnection();
    peerRef.current = pc;

    const dc = pc.createDataChannel("oai-events");
    dc.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.type ===
          "conversation.item.input_audio_transcription.delta"
        ) {
          onTranscriptDelta?.(payload.delta ?? "");
        }
        if (
          payload.type ===
          "conversation.item.input_audio_transcription.completed"
        ) {
          const text = payload.transcript ?? "";
          setLiveText((prev) => (prev ? `${prev} ${text}` : text));
          onTranscriptFinal?.(text);
        }
      } catch {
        // ignore malformed events
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    pc.addTrack(stream.getTracks()[0]);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    });

    if (!sdpResponse.ok) throw new Error("Realtime connection failed");

    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    setStatus("recording");
  }, [onTranscriptDelta, onTranscriptFinal]);

  const start = useCallback(async () => {
    setError(null);
    setLiveText("");
    setStatus("connecting");

    try {
      useRealtimeRef.current = false;
      await startRealtimeRecording();
      useRealtimeRef.current = true;
    } catch {
      await startChunkedRecording();
    }
  }, [startChunkedRecording, startRealtimeRecording]);

  const stop = useCallback(() => {
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  return {
    status,
    error,
    liveText,
    isRecording: status === "recording",
    start,
    stop,
    setLiveText,
  };
}
