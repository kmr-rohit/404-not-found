"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import type { Photo } from "../../drizzle/schema";

export function PhotoUpload({
  talkId,
  initialPhotos,
  onUploaded,
}: {
  talkId: string;
  initialPhotos: Photo[];
  onUploaded?: (photo: Photo) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("talkId", talkId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const photo = (await res.json()) as Photo;
      setPhotos((prev) => [photo, ...prev]);
      onUploaded?.(photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Session photos</h2>
          <p className="text-sm text-muted-foreground">
            Snap speaker slides or booth moments. Stored in Appwrite.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          Add photo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

      {photos.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <Upload className="mb-2 h-8 w-8" />
          No photos yet. Use your camera to capture the session.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="relative aspect-video bg-muted">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption ?? "Session photo"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
