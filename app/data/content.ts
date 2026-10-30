import React from "react";
import { BatchAnalyzerDescription } from "@/components/descriptions/BatchAnalyzerDescription";
import views from "./canon-views.generated.json";

import type {
  Category,
  Medium,
  PortfolioSurface,
  Status,
  Surface,
  Tag,
  Technology,
} from "./taxonomy";

// Vocabularies live in taxonomy.ts; re-exported so pages can import from here.
export * from "./taxonomy";

// Core content types
export type ContentType = "external" | "internal" | "media" | "collection";

// ---------------------------------------------------------------------------
// Authoring shape — what you write in NICKEL_SYSTEM.content below
// ---------------------------------------------------------------------------

// Metadata every surface reads. Write it once on the entry; to change any of
// it for a single surface, set the same key inside that surface's override
// (e.g. `designOverride: { description: "..." }`).
export interface ProjectDetails {
  title: string;
  description: string;
  category: Category;
  status?: Status; // defaults to "operational"
  date?: string; // "YYYY-MM" or "YYYY-MM-DD" (sortable); any other text is shown verbatim
  thumbnail?: string;
  why?: string;
  tech?: Technology[];
  mediums?: Medium[]; // art materials/techniques
  tags?: Tag[];
  source?: string; // repo link (the frontend one, if there are two)
  backendSource?: string;
}

// Settings only the desktop/mobile OS uses.
export interface DesktopOnly {
  title?: string; // replaces the entry title on the desktop only
  openInNewTab?: boolean; // external links only; defaults to true
  windowWidth?: number;
  windowHeight?: number;
  contentfulDescription?: ContentfulDescriptionComponent; // React component shown in the window's info modal
}

// Settings only the portfolio pages use.
export interface PortfolioOnly {
  // Software portfolio preview. Default: one desktop-sized iframe (or the 3D
  // frame for holodeck/sphere URLs). "none" hides it; mobileScreens shows
  // side-by-side phone iframes of the given URLs.
  preview?: "none" | { mobileScreens: string[] };
  artGrouping?: "primary" | "collection"; // art portfolio section; defaults to "primary"
}

type EntryLink =
  | { url: string; route?: never }
  | { route: string; url?: never };

export type ContentEntry = ProjectDetails &
  EntryLink & {
    id: string;
    // true keeps the entry off every surface (desktop OS, portfolio pages,
    // sitemap, llms.txt). It still shows up in this file, and this repo is
    // public, so don't put anything here you wouldn't want read.
    hide: boolean;
    surfaces: Surface[];
    desktopOnly?: DesktopOnly;
    portfolioOnly?: PortfolioOnly;
    desktopOverride?: Partial<ProjectDetails>;
    softwareOverride?: Partial<ProjectDetails>;
    designOverride?: Partial<ProjectDetails>;
    artOverride?: Partial<ProjectDetails>;
  };

// ---------------------------------------------------------------------------
// Resolved shapes — what the pages and components receive
// ---------------------------------------------------------------------------

interface BaseContent {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: Category;
  status: Status;
  date?: string;
  featured?: boolean;
  why?: string;
  tech?: Technology[];
  mediums?: Medium[];
  tags?: Tag[];
  source?: string;
  backendSource?: string;
  hasContentfulDescription?: boolean; // If true, modal shows React component instead of description
  contentfulDescription?: ContentfulDescriptionComponent; // React component to render in modal
}

export interface ExternalLink extends BaseContent {
  type: "external";
  url: string;
  openInNewTab: boolean;
}

export interface InternalApp extends BaseContent {
  type: "internal";
  route: string; // Next.js route
  windowWidth?: number; // Custom window width (overrides default)
  windowHeight?: number; // Custom window height (overrides default)
}

export interface MediaItem extends BaseContent {
  type: "media";
  mediaType: "image" | "video" | "3d-model";
  mediaUrl: string;
  dimensions?: { width: number; height: number };
}

export interface Collection extends BaseContent {
  type: "collection";
  items: string[]; // IDs of other content items
}

export type Content = ExternalLink | InternalApp | MediaItem | Collection;

// Type for contentful description renderer (defined after Content to avoid circular reference)
export type ContentfulDescriptionComponent = React.ComponentType<{
  content: Content;
}>;

export interface PortfolioProject extends Omit<
  ProjectDetails,
  "status" | "tech" | "mediums" | "tags"
> {
  id: string;
  status: Status;
  tech: Technology[];
  mediums: Medium[];
  tags: Tag[];
  url?: string;
  route?: string;
  preview?: PortfolioOnly["preview"];
  artGrouping: NonNullable<PortfolioOnly["artGrouping"]>;
}

export interface NickelSystem {
  version: string;
  content: ContentEntry[];
  featured: string[]; // IDs for dock/featured section
  desktopWallpaper?: string;
}

// Category icons come from Canon's taxonomy; anything without one gets 📄.
const CATEGORY_ICONS = new Map<string, string>(
  Object.values(views).flatMap((v) =>
    v.taxonomy.categories.map((c): [string, string] => [c.label, (c as { icon?: string }).icon ?? "📄"]),
  ),
);

export function getCategoryIcon(category: Category): string {
  return CATEGORY_ICONS.get(category) ?? "📄";
}

// ---------------------------------------------------------------------------
// Content comes from Canon
// ---------------------------------------------------------------------------
//
// Every project, its words and where it shows up are edited in Canon
// (github.com/nick5616/content-pipeline) and published as one view per
// surface: nickel-desktop, software-portfolio, design-portfolio and
// art-portfolio. scripts/fetch-canon-views.mjs bakes them in before each
// build; below they're mapped onto the shapes the OS and the portfolio
// pages have always used. Only the system windows (About, Contact,
// Settings) are defined here: they're app chrome, not content.

interface Term {
  slug: string;
  label: string;
}

interface ViewEntry {
  slug: string;
  title: string;
  summary: string;
  why: string;
  date: { value: string; label: string | null } | null;
  status: string | null;
  category: Term | null;
  tech: string[];
  tags: string[];
  mediums: string[];
  links: { rel: string; url: string }[];
}

interface DesktopEntry extends ViewEntry {
  open: {
    type: "route" | "url";
    route: string | null;
    url: string | null;
    newTab: boolean;
    window: { width: number | null; height: number | null } | null;
  };
  pinned: number | null;
  component: string | null;
}

interface PortfolioEntry extends ViewEntry {
  preview?: { kind: string; urls: string[] };
  thumbnail?: { url: string } | null;
  section?: "primary" | "collections";
  image?: { url: string } | null;
  cover?: { url: string } | null;
}

interface View<E> {
  taxonomy: { categories: Term[]; tech: Term[]; mediums: Term[]; tags: Term[] };
  entries: E[];
}

const VIEWS = views as unknown as {
  desktop: View<DesktopEntry>;
  software: View<PortfolioEntry>;
  design: View<PortfolioEntry>;
  art: View<PortfolioEntry>;
};

// Canon slugs that differ from the ids this site has always used (window
// ids, /desktop/<id> URLs, the menu bar's art shortcuts).
const LEGACY_IDS: Record<string, string> = {
  digitalart: "art-digital-art",
  paintings: "art-paintings",
  sketches: "art-sketches",
  lefthanded: "art-lefthanded",
  miscellaneous: "art-miscellaneous",
  notesappart: "art-notesappart",
  "rpg-quests": "videogamequest",
};
const idOf = (slug: string) => LEGACY_IDS[slug] ?? slug;

// Rich description keys (Canon's desktop placements) -> the components.
const COMPONENTS: Record<string, ContentfulDescriptionComponent> = {
  "batch-analyzer": BatchAnalyzerDescription,
};

// The fields every surface shares, with taxonomy slugs turned back into
// their labels.
function detailsOf(e: ViewEntry, taxonomy: View<ViewEntry>["taxonomy"]) {
  const label = (terms: Term[], slugs: string[]) =>
    slugs.map((s) => terms.find((t) => t.slug === s)?.label ?? s);
  const link = (rel: string) => e.links.find((l) => l.rel === rel)?.url;
  const live = link("live");
  return {
    title: e.title,
    description: e.summary,
    category: (e.category?.label ?? "Utility") as Category,
    status: (e.status ?? "operational") as Status,
    // Free-text dates keep their wording; formatDate shows 2025-10 as Oct 2025.
    date: e.date ? (e.date.label ?? e.date.value) : undefined,
    why: e.why || undefined,
    tech: label(taxonomy.tech, e.tech) as Technology[],
    mediums: label(taxonomy.mediums, e.mediums) as Medium[],
    tags: label(taxonomy.tags, e.tags) as Tag[],
    // A repo that is the project's only link is both its url and its source.
    source: link("source") ?? (live?.startsWith("https://github.com/") ? live : undefined),
    backendSource: link("backend-source"),
    live,
  };
}

function toDesktopContent(e: DesktopEntry): Content {
  const { live: _live, ...d } = detailsOf(e, VIEWS.desktop.taxonomy);
  const component = e.component ? COMPONENTS[e.component] : undefined;
  const base = {
    ...d,
    id: idOf(e.slug),
    featured: e.pinned !== null,
    hasContentfulDescription: !!component,
    contentfulDescription: component,
  };
  if (e.open.type === "route") {
    return {
      ...base,
      type: "internal",
      route: e.open.route!,
      windowWidth: e.open.window?.width ?? undefined,
      windowHeight: e.open.window?.height ?? undefined,
    };
  }
  return { ...base, type: "external", url: e.open.url!, openInNewTab: e.open.newTab };
}

// This site's own apps, by slug: the desktop view says which entries open
// a route, and the portfolio pages link those routes too, as they always did.
const ROUTES = new Map(
  VIEWS.desktop.entries.filter((e) => e.open.type === "route").map((e) => [e.slug, e.open.route!]),
);

function toPortfolioProject(
  e: PortfolioEntry,
  taxonomy: View<ViewEntry>["taxonomy"],
): PortfolioProject {
  const { live, ...d } = detailsOf(e, taxonomy);
  const route = ROUTES.get(e.slug);
  const preview = e.preview;
  return {
    ...d,
    id: idOf(e.slug),
    // A project's own thumbnail (art pieces: their image); collections'
    // covers aren't thumbnails.
    thumbnail: (e.thumbnail ?? e.image)?.url,
    url: route ? undefined : live,
    route,
    // desktop and laser-room frames come from the url, as before.
    preview:
      preview?.kind === "none"
        ? "none"
        : preview?.kind === "phones"
          ? { mobileScreens: preview.urls }
          : undefined,
    artGrouping: e.section === "collections" ? "collection" : "primary",
  };
}

// The system windows: app chrome, so they live here rather than in Canon.
const SYSTEM_CONTENT: Content[] = [
  {
    id: "about",
    type: "internal",
    title: "About Nickel OS",
    description: "System information and bio",
    route: "/about",
    category: "Utility",
    status: "operational",
    featured: false,
    hasContentfulDescription: false,
  },
  {
    id: "contact",
    type: "internal",
    title: "Contact",
    description: "Get in touch",
    route: "/contact",
    category: "Utility",
    status: "operational",
    featured: false,
    hasContentfulDescription: false,
  },
  {
    id: "settings",
    type: "internal",
    title: "Settings",
    description: "System preferences and customization",
    route: "/settings",
    category: "Utility",
    status: "operational",
    featured: false,
    hasContentfulDescription: false,
    windowHeight: 700,
  },
];

// Resolved once so callers get a stable array reference.
const DESKTOP_CONTENT: Content[] = [
  ...VIEWS.desktop.entries.map(toDesktopContent),
  ...SYSTEM_CONTENT,
];

const PORTFOLIO: Record<PortfolioSurface, PortfolioProject[]> = {
  software: VIEWS.software.entries.map((e) => toPortfolioProject(e, VIEWS.software.taxonomy)),
  design: VIEWS.design.entries.map((e) => toPortfolioProject(e, VIEWS.design.taxonomy)),
  art: VIEWS.art.entries.map((e) => toPortfolioProject(e, VIEWS.art.taxonomy)),
};

export const NICKEL_SYSTEM: NickelSystem = {
  version: "2.0.0",
  content: [],
  // The dock: Canon's pinned desktop placements, in order.
  featured: [...VIEWS.desktop.entries]
    .filter((e) => e.pinned !== null)
    .sort((a, b) => a.pinned! - b.pinned!)
    .map((e) => idOf(e.slug)),
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2025-10" / "2025-10-03" → "Oct 2025"; anything else is returned as-is.
export function formatDate(date: string): string {
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(date);
  const month = match && MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : date;
}

// Helper functions — desktop/mobile OS
export function getContentById(id: string): Content | undefined {
  return DESKTOP_CONTENT.find((item) => item.id === id);
}

export function getFeaturedContent(): Content[] {
  return NICKEL_SYSTEM.featured
    .map((id) => getContentById(id))
    .filter((item): item is Content => item !== undefined);
}

export function getContentByCategory(category: Category): Content[] {
  return DESKTOP_CONTENT.filter((item) => item.category === category);
}

export function getAllContent(): Content[] {
  return DESKTOP_CONTENT;
}

// Helper functions — metadata filtering (works on desktop Content and
// PortfolioProject alike)
type ListKey = "tech" | "mediums" | "tags";
type ListValue<K extends ListKey> = NonNullable<ProjectDetails[K]>[number];

export type MetadataFilter = {
  categories?: ReadonlySet<Category>;
  statuses?: ReadonlySet<Status>;
} & { [K in ListKey]?: ReadonlySet<ListValue<K>> };

type Filterable = Pick<ProjectDetails, "category" | "status" | ListKey>;

// True when the item has ANY selected value in ANY field (inclusive OR), or
// when nothing is selected at all.
export function matchesMetadata(
  item: Filterable,
  filter: MetadataFilter,
): boolean {
  const checks: [ReadonlySet<string> | undefined, readonly string[]][] = [
    [filter.categories, [item.category]],
    [filter.statuses, [item.status ?? "operational"]],
    [filter.tech, item.tech ?? []],
    [filter.mediums, item.mediums ?? []],
    [filter.tags, item.tags ?? []],
  ];
  const active = checks.filter(([selected]) => selected && selected.size > 0);
  return (
    active.length === 0 ||
    active.some(([selected, values]) => values.some((v) => selected!.has(v)))
  );
}

// The values of `key` actually used by `items`, most common first — i.e. the
// options worth showing in a filter UI.
export function getMetadataOptions<K extends ListKey>(
  items: Pick<ProjectDetails, K>[],
  key: K,
): ListValue<K>[] {
  const counts = new Map<ListValue<K>, number>();
  for (const item of items) {
    for (const value of (item[key] ?? []) as ListValue<K>[]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
}

// Helper functions — portfolio pages
export function getPortfolioProjects(
  surface: PortfolioSurface,
): PortfolioProject[] {
  return PORTFOLIO[surface];
}
