import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPortfolioProjects } from "@/app/data/content";
import { PROFILE } from "@/app/data/profile";

// One static, text-first page per software project — readable without JS by
// people, search engines, and AI tools.
const projects = getPortfolioProjects("software");

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return {};
  return {
    title: `${project.title} — ${PROFILE.name}`,
    description: project.description,
  };
}

export default async function SoftwareProjectPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const live = project.url ?? project.route;
  const links = [
    live && { label: "Visit site", href: live },
    project.source && {
      label: project.backendSource ? "Frontend source" : "Source",
      href: project.source,
    },
    project.backendSource && {
      label: "Backend source",
      href: project.backendSource,
    },
  ].filter((l): l is { label: string; href: string } => !!l);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-950 to-cyan-950 px-4 py-12 md:py-20">
      <article className="max-w-3xl mx-auto bg-zinc-900/80 rounded-2xl p-6 md:p-10 border border-green-800/50 space-y-8 text-zinc-300">
        <nav>
          <Link
            href="/portfolio/software"
            className="text-sm text-green-400 hover:underline"
          >
            ← All projects by {PROFILE.name}
          </Link>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold font-bbh-bartle text-zinc-100">
            {project.title}
          </h1>
          {project.date && (
            <p className="text-sm text-zinc-400">
              {formatDate(project.date)}
            </p>
          )}
        </header>

        <p className="text-lg leading-relaxed">{project.description}</p>

        {project.why && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Why I Built It
            </h2>
            <p className="leading-relaxed">{project.why}</p>
          </section>
        )}

        {project.tech.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Technologies
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li
                  key={tech}
                  className="px-3 py-1 bg-zinc-800/60 rounded-full text-sm border border-zinc-700"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.tags.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Tags
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="px-3 py-1 bg-blue-950/30 rounded-full text-sm text-blue-300 border border-blue-800"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {links.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Links
            </h2>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  {l.label}:{" "}
                  <a
                    href={l.href}
                    className="text-green-400 hover:underline break-all"
                  >
                    {l.href}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
