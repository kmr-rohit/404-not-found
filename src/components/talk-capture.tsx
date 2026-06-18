"use client";

import { useState } from "react";
import type { GeneratedOutput, Photo, Talk } from "../../drizzle/schema";
import { AudioRecorder } from "./audio-recorder";
import { PhotoUpload } from "./photo-upload";
import { GeneratedContentTabs } from "./generated-content-tabs";
import { ExportMarkdown } from "./export-markdown";

export function TalkCapture({
  talk,
  photos: initialPhotos,
  outputs: initialOutputs,
}: {
  talk: Talk;
  photos: Photo[];
  outputs: GeneratedOutput[];
}) {
  const [transcript, setTranscript] = useState(talk.transcript ?? "");
  const [photos, setPhotos] = useState(initialPhotos);
  const [outputs, setOutputs] = useState(initialOutputs);

  return (
    <>
      <div className="flex justify-end">
        <ExportMarkdown talk={{ ...talk, transcript }} photos={photos} outputs={outputs} />
      </div>
      <AudioRecorder
        talkId={talk.id}
        initialTranscript={transcript}
        onSaved={setTranscript}
      />
      <PhotoUpload
        talkId={talk.id}
        initialPhotos={photos}
        onUploaded={(photo) => setPhotos((prev) => [photo, ...prev])}
      />
      <GeneratedContentTabs
        talkId={talk.id}
        transcript={transcript}
        initialOutputs={outputs}
      />
    </>
  );
}
