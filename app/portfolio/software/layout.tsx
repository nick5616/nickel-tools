import type { Metadata } from "next";
import { PROFILE } from "@/app/data/profile";

// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: `${PROFILE.name} — Software Engineering Portfolio`,
  description: PROFILE.summary,
  alternates: {
    types: { "text/markdown": "/llms.txt" },
  },
};

export default function SoftwarePortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
