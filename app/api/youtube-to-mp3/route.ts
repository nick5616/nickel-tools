import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";

// Shells out to yt-dlp (https://github.com/yt-dlp/yt-dlp), which keeps up with
// YouTube's changes far better than any JS library. Needs yt-dlp and ffmpeg on
// the server: on PATH, or pointed at with YTDLP_PATH / FFMPEG_PATH.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_SECONDS = 60 * 60;

// Accepts watch, youtu.be, shorts, embed, live and music links (playlist/radio
// params are ignored) or a bare 11-character video ID.
function parseVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id =
      url.searchParams.get("v") ??
      url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/)?.[1] ??
      null;
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

function run(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function friendlyError(stderr: string): string {
  if (/confirm you.re not a bot|Sign in to confirm/i.test(stderr))
    return "YouTube is blocking this server right now. Try again later.";
  if (/age|inappropriate/i.test(stderr) && /sign in/i.test(stderr))
    return "This video is age-restricted and can't be converted.";
  if (/private video/i.test(stderr)) return "This video is private.";
  if (/members-only|join this channel/i.test(stderr)) return "This video is members-only.";
  if (/not available|unavailable|removed/i.test(stderr)) return "This video is unavailable.";
  return "Couldn't convert that video. Try another link.";
}

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("url") ?? "";
  const id = parseVideoId(input);
  if (!id) return json(400, "That doesn't look like a YouTube link.");

  const dir = await mkdtemp(path.join(tmpdir(), "yt-mp3-"));
  const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});

  const args = [
    `https://www.youtube.com/watch?v=${id}`,
    "--no-playlist",
    "--no-progress",
    "--no-warnings",
    "--js-runtimes", `node:${process.execPath}`,
    "--match-filter", `duration <= ${MAX_SECONDS} & !is_live`,
    "-f", "bestaudio/best",
    "-x", "--audio-format", "mp3", "--audio-quality", "192K",
    "--embed-metadata",
    "--print", "after_move:title",
    "-o", path.join(dir, "%(id)s.%(ext)s"),
  ];
  if (process.env.FFMPEG_PATH) args.push("--ffmpeg-location", process.env.FFMPEG_PATH);
  if (process.env.YTDLP_PROXY) args.push("--proxy", process.env.YTDLP_PROXY);

  try {
    const ytdlp = process.env.YTDLP_PATH || "yt-dlp";
    let result;
    try {
      result = await run(ytdlp, args);
    } catch (e) {
      await cleanup();
      console.error(`[youtube-to-mp3] couldn't run ${ytdlp}. Install yt-dlp or set YTDLP_PATH.`, e);
      return json(500, "yt-dlp isn't installed on this server.");
    }

    const file = (await readdir(dir)).find((f) => f.endsWith(".mp3"));
    if (result.code !== 0 || !file) {
      await cleanup();
      if (result.code === 0) return json(422, "Live streams and videos over an hour aren't supported.");
      console.error("[youtube-to-mp3]", id, result.stderr.trim().split("\n").slice(-3).join(" | "));
      return json(502, friendlyError(result.stderr));
    }

    const filePath = path.join(dir, file);
    const { size } = await stat(filePath);
    const title = result.stdout.trim().split("\n").pop() || id;
    const name = `${title.replace(/[\\/:*?"<>|\x00-\x1f]+/g, "").trim() || id}.mp3`;

    const stream = createReadStream(filePath);
    stream.on("close", cleanup);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(size),
        "Content-Disposition": `attachment; filename="${name.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    await cleanup();
    console.error("[youtube-to-mp3]", id, e);
    return json(500, "Something went wrong. Try again.");
  }
}
