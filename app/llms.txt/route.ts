import { formatDate, getPortfolioProjects } from "@/app/data/content";
import { PROFILE } from "@/app/data/profile";
import { liveUrl, siteOrigin } from "@/app/utils/siteOrigin";

// Plain-markdown summary of the software portfolio (https://llmstxt.org), so
// recruiters and AI tools can read it without running the JS-heavy pages.
export async function GET() {
  const origin = await siteOrigin();
  const projects = getPortfolioProjects("software");

  const lines = [
    `# ${PROFILE.name} — ${PROFILE.headline}`,
    "",
    `> ${PROFILE.summary}`,
    "",
    "## Contact",
    "",
    `- Email: ${PROFILE.links.email}`,
    `- LinkedIn: ${PROFILE.links.linkedin}`,
    `- GitHub: ${PROFILE.links.github}`,
    `- Software portfolio: ${origin}/portfolio/software`,
    "",
    `## Projects (${projects.length})`,
  ];

  for (const p of projects) {
    const live = liveUrl(p, origin);
    lines.push(
      "",
      `### [${p.title}](${origin}/portfolio/software/${p.id})`,
      "",
      p.description,
    );
    if (p.why) lines.push("", `Why: ${p.why}`);
    lines.push("");
    if (p.date) lines.push(`- Date: ${formatDate(p.date)}`);
    if (p.tech.length) lines.push(`- Tech: ${p.tech.join(", ")}`);
    if (p.tags.length) lines.push(`- Tags: ${p.tags.join(", ")}`);
    if (live) lines.push(`- Live: ${live}`);
    if (p.source) lines.push(`- Source: ${p.source}`);
    if (p.backendSource) lines.push(`- Backend source: ${p.backendSource}`);
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
