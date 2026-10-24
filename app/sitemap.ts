import type { MetadataRoute } from "next";
import { getPortfolioProjects } from "@/app/data/content";
import { siteOrigin } from "@/app/utils/siteOrigin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  const pages = [
    "/portfolio/software",
    "/portfolio/ux",
    "/portfolio/art",
    "/youtube-to-mp3",
    "/llms.txt",
  ];
  const projects = getPortfolioProjects("software").map(
    (p) => `/portfolio/software/${p.id}`,
  );
  return [...pages, ...projects].map((path) => ({ url: origin + path }));
}
