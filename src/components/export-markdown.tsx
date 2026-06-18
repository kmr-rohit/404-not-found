"use client";

import { Download } from "lucide-react";
import type { GeneratedOutput, Photo, Talk } from "../../drizzle/schema";

export function ExportMarkdown({
  talk,
  photos,
  outputs,
}: {
  talk: Talk;
  photos: Photo[];
  outputs: GeneratedOutput[];
}) {
  function exportFile() {
    const sections = [
      `# ${talk.title}`,
      talk.speaker ? `**Speaker:** ${talk.speaker}` : "",
      talk.track ? `**Track:** ${talk.track}` : "",
      "",
      "## Transcript",
      talk.transcript || "_No transcript yet_",
      "",
      "## AI Outputs",
      ...outputs.map((o) => `### ${o.type}\n${o.content}`),
      "",
      "## Photos",
      ...photos.map((p) => `- ${p.imageUrl}`),
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([sections], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${talk.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportFile}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
    >
      <Download className="h-4 w-4" />
      Export Markdown
    </button>
  );
}
