"use client";

import { useState, useMemo, useEffect } from "react";
import ProjectIframe from "@/components/ui/ProjectIframe";
import TechStackFilter from "@/components/ui/TechStackFilter";
import SlideIn from "@/components/ui/SlideIn";
import LaserRoomPreview from "@/components/ui/LaserRoomPreview";
import {
    Technology,
    Tag,
    normalizeTechnology,
    normalizeTag,
} from "@/app/portfolio/techStack";
import { type ViewMode } from "@/components/ui/TechStackFilter";
import { getContentBySurface } from "@/app/data/content";
import Clarity from "@microsoft/clarity";

// Pre-computed blob paths using superformula-inspired polar coordinates
// Generated with: seed, size=400, complexity, variance
// Formula: r = size + sin(θ*c)*size*0.15 + cos(θ*(c-2)+seed)*size*0.1 + sin(θ*c*2+seed*2)*size*0.05 + noise
const BLOB_PATHS = {
    // seed=1.618 (φ), complexity=5
    phi: "M 459 0 Q 459 0 456 26 Q 454 52 446 77 Q 438 102 425 125 Q 411 148 393 168 Q 374 189 352 206 Q 329 223 304 236 Q 278 249 251 257 Q 223 266 195 269 Q 166 273 137 271 Q 108 269 80 262 Q 52 254 27 242 Q 1 229 -22 212 Q -46 195 -66 174 Q -87 153 -103 129 Q -120 105 -131 79 Q -143 52 -149 24 Q -155 -4 -155 -32 Q -156 -61 -150 -89 Q -145 -117 -134 -143 Q -122 -170 -106 -194 Q -89 -218 -68 -238 Q -48 -259 -24 -275 Q 0 -292 26 -304 Q 53 -316 81 -323 Q 109 -330 138 -331 Q 167 -333 196 -329 Q 224 -325 252 -316 Q 279 -306 304 -292 Q 329 -277 351 -258 Q 373 -239 391 -217 Q 409 -194 423 -169 Q 436 -143 445 -116 Q 453 -88 457 -59 Q 460 -30 459 0 Z",
    // seed=2.718 (e), complexity=7
    euler: "M 449 0 Q 449 0 443 29 Q 437 58 424 85 Q 411 111 393 134 Q 374 157 351 176 Q 327 194 301 208 Q 274 221 245 230 Q 216 238 186 241 Q 156 244 126 241 Q 96 238 67 230 Q 38 221 12 208 Q -15 194 -38 176 Q -62 157 -81 134 Q -101 111 -115 85 Q -129 58 -137 29 Q -145 0 -147 -30 Q -149 -60 -144 -90 Q -140 -119 -129 -147 Q -118 -175 -101 -200 Q -84 -225 -62 -247 Q -40 -268 -14 -285 Q 12 -302 40 -314 Q 69 -325 99 -331 Q 130 -337 161 -337 Q 192 -337 222 -331 Q 252 -325 281 -314 Q 309 -302 334 -285 Q 359 -268 380 -247 Q 401 -225 417 -200 Q 433 -175 444 -147 Q 454 -119 459 -90 Q 463 -60 461 -30 Q 459 0 449 0 Z",
    // seed=3.141 (π), complexity=6
    pi: "M 454 0 Q 454 0 449 28 Q 444 56 433 83 Q 421 109 404 132 Q 386 156 364 175 Q 341 195 315 210 Q 288 225 259 235 Q 230 245 199 250 Q 169 254 138 253 Q 107 251 77 244 Q 48 236 20 223 Q -7 210 -32 193 Q -57 175 -78 153 Q -99 131 -116 106 Q -132 80 -143 52 Q -154 24 -159 -5 Q -165 -35 -164 -65 Q -164 -95 -157 -124 Q -150 -153 -138 -181 Q -125 -208 -107 -232 Q -89 -256 -67 -277 Q -44 -297 -18 -313 Q 8 -328 37 -339 Q 66 -349 96 -354 Q 127 -359 158 -358 Q 189 -357 219 -350 Q 249 -343 277 -331 Q 305 -318 330 -301 Q 354 -283 375 -261 Q 395 -239 411 -213 Q 426 -187 437 -159 Q 447 -130 452 -100 Q 457 -70 457 -40 Q 457 -10 454 0 Z",
    // seed=0.577 (γ), complexity=8
    gamma: "M 445 0 Q 445 0 438 27 Q 431 54 418 79 Q 405 104 387 126 Q 369 148 347 167 Q 324 185 299 200 Q 273 214 245 224 Q 217 233 188 238 Q 158 242 129 241 Q 99 240 70 234 Q 42 227 15 216 Q -12 204 -36 188 Q -60 172 -81 152 Q -101 132 -118 109 Q -134 85 -145 59 Q -157 33 -163 5 Q -169 -23 -169 -51 Q -169 -80 -163 -108 Q -157 -136 -145 -162 Q -133 -189 -116 -213 Q -99 -237 -78 -258 Q -56 -278 -32 -295 Q -7 -311 20 -323 Q 48 -334 77 -341 Q 107 -347 137 -348 Q 167 -349 197 -344 Q 227 -340 256 -330 Q 284 -319 310 -304 Q 335 -289 357 -269 Q 379 -250 397 -227 Q 414 -203 427 -177 Q 439 -150 447 -122 Q 454 -93 456 -63 Q 458 -33 455 -3 Q 452 27 445 0 Z",
} as const;

// Layout types enum
export type ProjectLayoutType =
    | "desktop"
    | "single-mobile"
    | "double-mobile"
    | "no-iframe"
    | "laser-room";

interface ProjectLayoutConfig {
    layout: ProjectLayoutType;
    sources: string[]; // For double-mobile, this will have 2 sources
}

// Function to map project ID to layout configuration
function getProjectLayout(
    projectId: string,
    route?: string,
    url?: string,
): ProjectLayoutConfig {
    // Projects that are always no-iframe regardless of url/route
    const NO_IFRAME_IDS = ["chaos", "voice-lab", "the-circle"];
    if (NO_IFRAME_IDS.includes(projectId)) {
        return { layout: "no-iframe", sources: [] };
    }

    // Handle internal routes
    if (route) {
        switch (projectId) {
            case "pokemon-or-technology":
                return {
                    layout: "desktop",
                    sources: [route],
                };
            case "choice-engine":
                return {
                    layout: "desktop",
                    sources: [route],
                };
            case "resume-builder":
                return {
                    layout: "desktop",
                    sources: [route],
                };
            case "smart-piano":
                return {
                    layout: "desktop",
                    sources: [route],
                };
            default:
                return {
                    layout: "desktop",
                    sources: [route],
                };
        }
    }

    // Handle external URLs
    if (url) {
        // 3D web environments
        if (
            url.includes("nicolebelovoskey.com") ||
            url.includes("sphere.saucedog.art")
        ) {
            return { layout: "laser-room", sources: [url] };
        }
        console.log("projectId", projectId);
        console.log("url", url);

        switch (projectId) {
            case "friendex":
                return {
                    layout: "double-mobile",
                    sources: [
                        "https://friendex.online/",
                        "https://friendex.online/demo",
                    ],
                };
            case "tierlistify":
                return {
                    layout: "double-mobile",
                    sources: [
                        "https://tierlistify.com/init",
                        "https://tierlistify.com/creation/1776295779582",
                    ],
                };
            case "videogamequest":
                return {
                    layout: "double-mobile",
                    sources: [
                        "https://videogamequest.me/",
                        "https://videogamequest.me/demo",
                    ],
                };
            case "passionfruit":
                return {
                    layout: "desktop",
                    sources: [url],
                };
            case "batch-analyzer":
                return {
                    layout: "desktop",
                    sources: [url],
                };
            case "chaos":
                return {
                    layout: "no-iframe",
                    sources: [],
                };
            case "voice-lab":
                return {
                    layout: "no-iframe",
                    sources: [],
                };
            case "plasma-sphere":
                return {
                    layout: "desktop",
                    sources: [url],
                };
            default:
                return {
                    layout: "desktop",
                    sources: [url],
                };
        }
    }

    // Default fallback
    return {
        layout: "desktop",
        sources: [],
    };
}

interface Project {
    id: string;
    title: string;
    description: string;
    why: string;
    tech: Technology[];
    tags: Tag[];
    url?: string;
    route?: string;
    frontendSource?: string;
    backendSource?: string;
    dateString?: string;
}

// Single source of truth lives in app/data/content.ts — every entry tagged
// with surfaces: ["software-portfolio", ...] shows up here automatically.
const projects: Project[] = getContentBySurface("software-portfolio").map(
    (item): Project => ({
        id: item.id,
        title: item.title,
        description: item.portfolio?.description ?? item.description,
        why: item.portfolio?.why ?? "",
        tech: (item.portfolio?.tech ?? [])
            .map((t) => normalizeTechnology(t))
            .filter((t): t is Technology => t !== null),
        tags: (item.portfolio?.tags ?? [])
            .map((t) => normalizeTag(t))
            .filter((t): t is Tag => t !== null),
        url: item.type === "external" ? item.url : undefined,
        route: item.type === "internal" ? item.route : undefined,
        frontendSource: item.portfolio?.frontendSource,
        backendSource: item.portfolio?.backendSource,
        dateString: item.portfolio?.dateLabel,
    }),
);

function GitHubIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-white"
            aria-hidden="true"
        >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

export default function SoftwarePortfolioPage() {
    const [selectedTech, setSelectedTech] = useState<Set<Technology>>(
        new Set(),
    );
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>("curated");
    const [refreshTriggers, setRefreshTriggers] = useState<
        Record<string, number>
    >({});

    const triggerRefresh = (projectId: string) =>
        setRefreshTriggers((prev) => ({
            ...prev,
            [projectId]: (prev[projectId] ?? 0) + 1,
        }));

    // Init Clarity once
    useEffect(() => {
        const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
        if (id) {
            Clarity.init(id);
            Clarity.setTag("page", "software-portfolio");
        }
    }, []);

    const sortedTech = useMemo(() => {
        const counts = new Map<Technology, number>();
        for (const p of projects) {
            for (const t of p.tech) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        return [...counts.keys()].sort(
            (a, b) => counts.get(b)! - counts.get(a)!,
        );
    }, []);

    const sortedTags = useMemo(() => {
        const counts = new Map<Tag, number>();
        for (const p of projects) {
            for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        return [...counts.keys()].sort(
            (a, b) => counts.get(b)! - counts.get(a)!,
        );
    }, []);

    // Filter projects based on selected tech and tags (inclusive OR logic)
    const filteredProjects = useMemo(() => {
        if (selectedTech.size === 0 && selectedTags.size === 0) {
            return projects;
        }

        return projects.filter((project) => {
            const matchesTech = project.tech.some((tech) =>
                selectedTech.has(tech),
            );
            const matchesTags = project.tags.some((tag) =>
                selectedTags.has(tag),
            );

            if (selectedTech.size > 0 && selectedTags.size > 0) {
                return matchesTech || matchesTags;
            }
            if (selectedTech.size > 0) return matchesTech;
            if (selectedTags.size > 0) return matchesTags;
            return false;
        });
    }, [selectedTech, selectedTags]);

    const clarityReady = () =>
        typeof window !== "undefined" &&
        typeof (window as Window & { clarity?: unknown }).clarity ===
            "function";

    const handleToggleTech = (tech: Technology) => {
        setSelectedTech((prev) => {
            const next = new Set(prev);
            if (next.has(tech)) {
                next.delete(tech);
            } else {
                next.add(tech);
                if (clarityReady()) {
                    Clarity.event("filter_tech");
                    Clarity.setTag("filtered_tech", tech);
                }
            }
            return next;
        });
    };

    const handleToggleTag = (tag: Tag) => {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) {
                next.delete(tag);
            } else {
                next.add(tag);
                if (clarityReady()) {
                    Clarity.event("filter_tag");
                    Clarity.setTag("filtered_tag", tag);
                }
            }
            return next;
        });
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (clarityReady()) {
            Clarity.event("view_mode_changed");
            Clarity.setTag("view_mode", mode);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-950 to-cyan-950">
            {/* Background SVG Blobs - Large, edge-positioned, flowing off page */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Left edge blob - emerald/teal, top half */}
                <svg
                    className="absolute -left-[40%] top-[5%] w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] opacity-[0.12]"
                    viewBox="-500 -500 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <linearGradient
                            id="grad1"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path d={BLOB_PATHS.phi} fill="url(#grad1)" />
                </svg>

                {/* Right edge blob - cyan/blue, middle */}
                <svg
                    className="absolute -right-[35%] top-[30%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] opacity-[0.10]"
                    viewBox="-500 -500 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <linearGradient
                            id="grad2"
                            x1="0%"
                            y1="100%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    <path d={BLOB_PATHS.euler} fill="url(#grad2)" />
                </svg>

                {/* Left edge blob - violet/purple, bottom half */}
                <svg
                    className="absolute -left-[45%] top-[55%] w-[90vw] h-[90vw] max-w-[1400px] max-h-[1400px] opacity-[0.08]"
                    viewBox="-500 -500 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <linearGradient
                            id="grad3"
                            x1="100%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <path d={BLOB_PATHS.pi} fill="url(#grad3)" />
                </svg>

                {/* Right edge blob - teal/emerald, bottom */}
                <svg
                    className="absolute -right-[50%] top-[75%] w-[85vw] h-[85vw] max-w-[1300px] max-h-[1300px] opacity-[0.09]"
                    viewBox="-500 -500 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <linearGradient
                            id="grad4"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    <path d={BLOB_PATHS.gamma} fill="url(#grad4)" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Bio Section */}
                <section className="px-2 py-16 md:py-24 max-w-4xl mx-auto">
                    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl py-8 px-4 md:p-12 shadow-xl border border-green-800/50">
                        <h1 className="text-xl md:text-3xl font-bold font-bbh-bartle text-zinc-100 mb-6">
                            Software Engineering
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
                            I&apos;m a software developer with experience across
                            big tech at{" "}
                            <span className="font-semibold text-green-400">
                                Microsoft
                            </span>{" "}
                            and{" "}
                            <span className="font-semibold text-green-400">
                                DoorDash
                            </span>
                            , as well as{" "}
                            <span className="font-semibold text-teal-400">
                                several
                            </span>{" "}
                            early-stage startups . I hold a Bachelor&apos;s
                            degree in Computer Science from{" "}
                            <span className="font-semibold text-cyan-400">
                                Texas A&M University
                            </span>
                            .
                        </p>
                        <TechStackFilter
                            selectedTech={selectedTech}
                            selectedTags={selectedTags}
                            onToggleTech={handleToggleTech}
                            onToggleTag={handleToggleTag}
                            sortedTech={sortedTech}
                            sortedTags={sortedTags}
                            numProjects={filteredProjects.length}
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                        />
                    </div>
                </section>

                {/* Projects Section */}
                <section className="px-4 md:px-8 lg:px-8 pb-24 space-y-24">
                    {filteredProjects.length === 0 ? (
                        <div className="max-w-7xl mx-auto text-center py-16">
                            <p className="text-lg text-zinc-400">
                                No projects match the selected filters. Try
                                selecting different tech stack options.
                            </p>
                        </div>
                    ) : (
                        filteredProjects.map((project, index) => {
                            const baseLayout = getProjectLayout(
                                project.id,
                                project.route,
                                project.url,
                            );

                            // Override layout based on viewMode
                            const layoutConfig = (() => {
                                if (viewMode === "curated") return baseLayout;
                                // no-iframe has no frame to resize
                                if (baseLayout.layout === "no-iframe")
                                    return baseLayout;
                                // laser-room keeps its layout type but rendering uses viewMode directly
                                if (baseLayout.layout === "laser-room")
                                    return baseLayout;
                                if (viewMode === "mobile") {
                                    return {
                                        layout: "single-mobile" as const,
                                        sources: [baseLayout.sources[0]],
                                    };
                                }
                                if (viewMode === "desktop") {
                                    return {
                                        layout: "desktop" as const,
                                        sources: [baseLayout.sources[0]],
                                    };
                                }
                                return baseLayout;
                            })();

                            // 3D frames: desktop by default (curated + desktop), mobile only when explicitly chosen or on mobile
                            const laserRoomMobile =
                                layoutConfig.layout === "laser-room" &&
                                viewMode === "mobile";

                            // Determine column widths based on layout
                            const getColumnClasses = () => {
                                switch (layoutConfig.layout) {
                                    case "desktop":
                                        return {
                                            description: "lg:col-span-3",
                                            iframe: "lg:col-span-7",
                                        };
                                    case "single-mobile":
                                        return {
                                            description: "lg:col-span-4",
                                            iframe: "lg:col-span-6",
                                        };
                                    case "double-mobile":
                                        return {
                                            description: "lg:col-span-3",
                                            iframe: "lg:col-span-7",
                                        };
                                    case "no-iframe":
                                        return {
                                            description: "lg:col-span-10",
                                            iframe: "lg:col-span-5",
                                        };
                                    case "laser-room":
                                        return laserRoomMobile
                                            ? {
                                                  description: "lg:col-span-4",
                                                  iframe: "lg:col-span-6",
                                              }
                                            : {
                                                  description: "lg:col-span-3",
                                                  iframe: "lg:col-span-7",
                                              };
                                }
                            };

                            const columnClasses = getColumnClasses();
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={project.id}
                                    className="max-w-7xl mx-auto"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 items-start">
                                        {/* Description Side */}
                                        <div
                                            className={`order-2 ${
                                                columnClasses.description
                                            } ${
                                                isEven
                                                    ? "lg:order-1"
                                                    : "lg:order-2"
                                            }`}
                                        >
                                            <SlideIn
                                                from={isEven ? "left" : "right"}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-3">
                                                    <h2 className="text-xl md:text-2xl font-bold font-bbh-bartle text-zinc-100">
                                                        {project.title}
                                                    </h2>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(project.url ||
                                                            project.route) && (
                                                            <a
                                                                href={
                                                                    project.url ??
                                                                    project.route
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-xs font-medium hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="w-3.5 h-3.5 fill-none stroke-current stroke-2"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                                                    />
                                                                </svg>
                                                                Visit site
                                                            </a>
                                                        )}
                                                        {project.frontendSource &&
                                                        project.backendSource ? (
                                                            <>
                                                                <a
                                                                    href={
                                                                        project.frontendSource
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black rounded-md text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                                                                >
                                                                    <GitHubIcon />
                                                                    Frontend
                                                                </a>
                                                                <a
                                                                    href={
                                                                        project.backendSource
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black rounded-md text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                                                                >
                                                                    <GitHubIcon />
                                                                    Backend
                                                                </a>
                                                            </>
                                                        ) : project.frontendSource ||
                                                          project.backendSource ? (
                                                            <a
                                                                href={
                                                                    (project.frontendSource ??
                                                                        project.backendSource)!
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-black rounded-md text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <GitHubIcon />
                                                                Source
                                                            </a>
                                                        ) : null}
                                                        {layoutConfig.layout !==
                                                            "no-iframe" && (
                                                            <button
                                                                onClick={() =>
                                                                    triggerRefresh(
                                                                        project.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-xs font-medium hover:bg-zinc-700 transition-colors"
                                                                title="Reload preview"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="w-3.5 h-3.5 fill-none stroke-current stroke-2"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                                                    />
                                                                </svg>
                                                                Refresh
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {project.dateString && (
                                                        <p className="text-xs text-zinc-300">
                                                            {project.dateString}
                                                        </p>
                                                    )}
                                                    <div className="max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                                                        <p className="text-lg text-zinc-300 leading-relaxed">
                                                            {
                                                                project.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                                                        Why I Built It
                                                    </h3>
                                                    <div className="max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                                                        <p className="text-zinc-400 leading-relaxed">
                                                            {project.why}
                                                        </p>
                                                    </div>
                                                </div>
                                                {project.tech.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                                                            Technologies
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.tech.map(
                                                                (tech) => (
                                                                    <span
                                                                        key={
                                                                            tech
                                                                        }
                                                                        className="px-3 py-1 bg-zinc-800/60 backdrop-blur-sm rounded-full text-sm text-zinc-300 border border-zinc-700"
                                                                    >
                                                                        {tech}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {project.tags.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                                                            Tags
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="px-3 py-1 bg-blue-950/30 backdrop-blur-sm rounded-full text-sm text-blue-300 border border-blue-800"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </SlideIn>
                                        </div>

                                        {/* Iframe/CTA Side */}
                                        {layoutConfig.layout ===
                                        "laser-room" ? (
                                            <div
                                                className={`order-1 relative ${columnClasses.iframe} ${isEven ? "lg:order-2" : "lg:order-1"}`}
                                            >
                                                <SlideIn
                                                    from={
                                                        isEven
                                                            ? "right"
                                                            : "left"
                                                    }
                                                    className="h-full"
                                                >
                                                    <div
                                                        className={`${laserRoomMobile ? "w-[300px] md:w-[400px]" : "w-full"} h-[400px] md:h-[560px] rounded-lg`}
                                                    >
                                                        <LaserRoomPreview
                                                            src={
                                                                layoutConfig
                                                                    .sources[0]
                                                            }
                                                        />
                                                    </div>
                                                </SlideIn>
                                            </div>
                                        ) : layoutConfig.layout ===
                                          "no-iframe" ? null : layoutConfig.layout ===
                                          "double-mobile" ? (
                                            <div
                                                className={`order-1 relative ${
                                                    columnClasses.iframe
                                                } ${
                                                    isEven
                                                        ? "lg:order-2"
                                                        : "lg:order-1"
                                                }`}
                                            >
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                    {layoutConfig.sources.map(
                                                        (source, idx) => (
                                                            <ProjectIframe
                                                                key={idx}
                                                                src={source}
                                                                title={`${
                                                                    project.title
                                                                } - View ${
                                                                    idx + 1
                                                                }`}
                                                                mobileDimensions={
                                                                    true
                                                                }
                                                                slideFrom={
                                                                    isEven
                                                                        ? "right"
                                                                        : "left"
                                                                }
                                                                refreshTrigger={
                                                                    refreshTriggers[
                                                                        project
                                                                            .id
                                                                    ] ?? 0
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`order-1 relative ${
                                                    columnClasses.iframe
                                                } ${
                                                    isEven
                                                        ? "lg:order-2"
                                                        : "lg:order-1"
                                                }`}
                                            >
                                                {layoutConfig.sources[0] && (
                                                    <ProjectIframe
                                                        src={
                                                            layoutConfig
                                                                .sources[0]
                                                        }
                                                        title={project.title}
                                                        mobileDimensions={
                                                            layoutConfig.layout ===
                                                            "single-mobile"
                                                        }
                                                        slideFrom={
                                                            isEven
                                                                ? "right"
                                                                : "left"
                                                        }
                                                        refreshTrigger={
                                                            refreshTriggers[
                                                                project.id
                                                            ] ?? 0
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>
            </div>
        </div>
    );
}
