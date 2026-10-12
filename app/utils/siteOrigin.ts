import { headers } from "next/headers";

// The site is served from more than one hostname, so absolute URLs (sitemap,
// robots, llms.txt) are built from whichever host the request came in on.
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "nickeltools.dev";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Absolute link to the live project: external URL as-is, internal route on
// this origin.
export function liveUrl(
  project: { url?: string; route?: string },
  origin: string,
): string | undefined {
  return project.url ?? (project.route ? origin + project.route : undefined);
}
