"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; name: string }
  | { kind: "error"; message: string };

function filenameFrom(disposition: string | null): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/)?.[1];
  return encoded ? decodeURIComponent(encoded) : "audio.mp3";
}

export default function YoutubeToMp3() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const convert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || status.kind === "working") return;
    setStatus({ kind: "working" });
    try {
      const res = await fetch(`/api/youtube-to-mp3?url=${encodeURIComponent(url.trim())}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Try again.");
      }
      const name = filenameFrom(res.headers.get("Content-Disposition"));
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      setStatus({ kind: "done", name });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 text-neutral-900 dark:text-neutral-100">
      <form onSubmit={convert} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          inputMode="url"
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Paste a YouTube link"
          aria-label="YouTube link"
          className="flex-1 min-w-0 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-3 text-sm bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <button
          type="submit"
          disabled={!url.trim() || status.kind === "working"}
          className="px-5 py-3 rounded-lg text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status.kind === "working" ? "Converting…" : "Convert to MP3"}
        </button>
      </form>

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 min-h-[1rem]" aria-live="polite">
        {status.kind === "working" && "Fetching and converting. This usually takes 10–20 seconds."}
        {status.kind === "done" && `Downloaded ${status.name}`}
        {status.kind === "error" && (
          <span className="text-red-600 dark:text-red-400">{status.message}</span>
        )}
      </p>
    </div>
  );
}
