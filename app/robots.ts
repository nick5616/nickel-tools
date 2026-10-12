import type { MetadataRoute } from "next";
import { siteOrigin } from "@/app/utils/siteOrigin";

// Everything is public — recruiters' AI tools and search engines are welcome.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await siteOrigin();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
