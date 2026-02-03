"use client";

import { useState, useMemo } from "react";
import ProjectIframe from "@/components/ui/ProjectIframe";
import TechStackFilter from "@/components/ui/TechStackFilter";
import SlideIn from "@/components/ui/SlideIn";
import {
    Technology,
    Tag,
    normalizeTechnology,
    normalizeTag,
} from "@/app/portfolio/techStack";

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
    | "no-iframe";

interface ProjectLayoutConfig {
    layout: ProjectLayoutType;
    sources: string[]; // For double-mobile, this will have 2 sources
}

// Function to map project ID to layout configuration
function getProjectLayout(
    projectId: string,
    route?: string,
    url?: string
): ProjectLayoutConfig {
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
                    layout: "single-mobile",
                    sources: [
                        "https://tierlistify.com/",
                        "https://tierlistify.com/",
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

const projects = [
    {
        id: "friendex",
        title: "Friendex",
        description:
            "A pokédex for your friends—a mobile-first social app that lets you collect and organize information about the people in your life. Built with a focus on delightful mobile interactions and intuitive navigation.",
        why: "I created friendex because I wanted a fun, gamified way to remember details about friends. The pokédex metaphor makes it engaging, and the mobile-first design ensures it's easy to use on the go when you're actually with people.",
        tech: ["React"],
        tags: ["Mobile-First", "Social App", "Web Development"],
        url: "https://friendex.online",
        color: "from-sky-500/20 to-cyan-500/20",
        borderColor: "border-sky-400/30",
        blobColor: "#0ea5e9",
    },
    {
        id: "videogamequest",
        title: "RPG Quests",
        description:
            "Convert journal entries into video game quests and live your life like an RPG. This productivity app gamifies your daily life by transforming your goals and activities into quest-like experiences.",
        why: "I built videogamequest because I wanted to make productivity and journaling more engaging. By framing life events as RPG quests, it adds a layer of fun and motivation to tracking your progress and achieving goals.",
        tech: ["React"],
        tags: [
            "AI Integration",
            "Productivity Tools",
            "Gamification",
            "Journaling",
        ],
        url: "https://videogamequest.me",
        color: "from-indigo-500/20 to-purple-500/20",
        borderColor: "border-indigo-400/30",
        blobColor: "#6366f1",
    },
    {
        id: "smart-piano",
        title: "Smart Piano",
        description:
            "An intelligent web-based piano that analyzes musical context and suggests harmonically appropriate next notes based on the key you're playing in.",
        why: "I wanted to create a tool that helps people learn music theory through play. Instead of just showing scales or chords, Smart Piano provides real-time musical guidance, making it easier to create pleasing melodies even if you're not an expert musician.",
        tech: ["TypeScript", "React", "Web Audio API", "Next.js"],
        tags: ["Music Theory Algorithms"],
        route: "/smart-piano",
        color: "from-cyan-500/20 to-blue-500/20",
        borderColor: "border-cyan-400/30",
        blobColor: "#06b6d4",
    },
    {
        id: "batch-analyzer",
        title: "Batch Analyzer",
        description:
            "A tool that batch processes product images by sending the same queries to each image in a batch using Large Language Models. Perfect for e-commerce teams analyzing product catalogs at scale.",
        why: "While working on product analysis tasks, I found myself repeatedly asking the same questions about different images. This tool automates that workflow, allowing teams to analyze entire product catalogs efficiently with custom LLM integrations.",
        tech: ["TypeScript", "React", "LLM APIs"],
        tags: ["Image Processing", "Batch Processing"],
        url: "https://batch-analyzer.netlify.app/",
        color: "from-violet-500/20 to-purple-500/20",
        borderColor: "border-violet-400/30",
        blobColor: "#8b5cf6",
    },
    {
        id: "passionfruit",
        title: "Passionfruit",
        description:
            "A project tracking tool that helps you conveniently track and understand all the projects you're working on. Integrates with GitHub to provide insights into your activity.",
        why: "I created Passionfruit to solve my own problem of keeping track of multiple projects.",
        tech: ["React"],
        tags: ["Project Management", "Productivity Tools"],
        url: "https://yieldpassionfruit.netlify.app",
        color: "from-yellow-500/20 to-orange-500/20",
        borderColor: "border-yellow-400/30",
        blobColor: "#eab308",
    },
    // {
    //     id: "resume-builder",
    //     title: "Online LaTeX Resume Builder",
    //     description:
    //         "A privacy-first resume builder that compiles LaTeX directly in your browser using WebAssembly. No server-side processing, no data collection—just you and your resume.",
    //     why: "I built this because I was frustrated with resume builders that required accounts, stored your data, or had limited formatting options. LaTeX produces beautiful, professional resumes, but the setup barrier is high. This tool removes that barrier entirely.",
    //     tech: ["TypeScript", "React", "WebAssembly", "LaTeX", "Next.js"],
    //     tags: [],
    //     route: "/resume-editor",
    //     color: "from-emerald-500/20 to-teal-500/20",
    //     borderColor: "border-emerald-400/30",
    //     blobColor: "#10b981",
    // },
    {
        id: "chaos",
        title: "CHAOS",
        description:
            "Counter-Strike Highlight Analysis and Organization System. A desktop application that batch processes video game footage and automatically identifies noteworthy moments using machine learning (OCR and Speech-to-Text).",
        why: "As a Counter-Strike player, I wanted to automatically find and organize my best plays from hours of gameplay footage. Manually scrubbing through videos is tedious, so I built CHAOS to use ML to detect kills, callouts, and other significant moments automatically.",
        tech: ["Python"],
        tags: [
            "Machine Learning",
            "OCR",
            "Speech-to-Text",
            "Video Processing",
            "Computer Vision",
        ],
        url: "https://github.com/nick5616/CHAOS",
        color: "from-rose-500/20 to-pink-500/20",
        borderColor: "border-rose-400/30",
        blobColor: "#f43f5e",
    },

    {
        id: "tierlistify",
        title: "Tierlistify",
        description:
            "A mobile-optimized tier list maker that makes ranking anything quick and intuitive. Built specifically to address the pain points of existing tier list tools on mobile devices.",
        why: "I built tierlistify because I was frustrated with how poorly existing tier list tools worked on mobile. I wanted to create something that felt native to touch interfaces, with smooth drag-and-drop interactions and a clean, focused UI.",
        tech: ["React"],
        tags: [
            "Mobile UX",
            "Touch Interactions",
            "Drag & Drop",
            "Progressive Web App",
        ],
        url: "https://tierlistify.com",
        color: "from-purple-500/20 to-pink-500/20",
        borderColor: "border-purple-400/30",
        blobColor: "#a855f7",
    },
    
    // {
    //     id: "choice-engine",
    //     title: "Choice Picker",
    //     description:
    //         "Spin the wheel to make decisions! Add your options and let chance decide. A simple, fun utility for when you can't choose between options.",
    //     why: "I built this as a quick utility tool for decision-making. Sometimes you just need a random picker, and I wanted something clean and simple without the clutter of other decision-making apps.",
    //     tech: ["TypeScript", "React", "Next.js"],
    //     tags: [],
    //     route: "/choice-picker",
    //     color: "from-lime-500/20 to-green-500/20",
    //     borderColor: "border-lime-400/30",
    //     blobColor: "#84cc16",
    // },
    {
        id: "pokemon-or-technology",
        title: "Pokemon or Technology",
        description:
            "Test your knowledge! Can you tell the difference between a Pokémon name and a technology term? A fun quiz game that challenges your ability to distinguish between these two worlds.",
        why: "I created this as a fun, lighthearted game that combines two of my interests—Pokémon and technology. It's a simple concept but surprisingly challenging and entertaining.",
        tech: ["TypeScript", "React", "Next.js"],
        tags: [],
        route: "/pokemon-or-technology",
        color: "from-red-500/20 to-orange-500/20",
        borderColor: "border-red-400/30",
        blobColor: "#ef4444",
    },
];

export default function SoftwarePortfolioPage() {
    const [selectedTech, setSelectedTech] = useState<Set<Technology>>(
        new Set()
    );
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());

    // Normalize technologies and tags for each project
    const projectsWithNormalized = useMemo(() => {
        return projects.map((project) => ({
            ...project,
            normalizedTech: (project.tech || [])
                .map((t) => normalizeTechnology(t))
                .filter((t): t is Technology => t !== null),
            normalizedTags: (project.tags || [])
                .map((t) => normalizeTag(t))
                .filter((t): t is Tag => t !== null),
        }));
    }, []);

    // Filter projects based on selected tech and tags (inclusive OR logic)
    const filteredProjects = useMemo(() => {
        if (selectedTech.size === 0 && selectedTags.size === 0) {
            return projectsWithNormalized;
        }

        return projectsWithNormalized.filter((project) => {
            // Check if project has ANY of the selected technologies
            const matchesTech = project.normalizedTech.some((tech) =>
                selectedTech.has(tech)
            );

            // Check if project has ANY of the selected tags
            const matchesTags = project.normalizedTags.some((tag) =>
                selectedTags.has(tag)
            );

            // If both filters are active, project matches if it has any selected tech OR any selected tag
            if (selectedTech.size > 0 && selectedTags.size > 0) {
                return matchesTech || matchesTags;
            }

            // If only tech is selected, require tech match
            if (selectedTech.size > 0) {
                return matchesTech;
            }

            // If only tags are selected, require tag match
            if (selectedTags.size > 0) {
                return matchesTags;
            }

            // Should not reach here, but return false as fallback
            return false;
        });
    }, [projectsWithNormalized, selectedTech, selectedTags]);

    const handleToggleTech = (tech: Technology) => {
        setSelectedTech((prev) => {
            const next = new Set(prev);
            if (next.has(tech)) {
                next.delete(tech);
            } else {
                next.add(tech);
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
            }
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-green-950 dark:via-teal-950 dark:to-cyan-950">
            {/* Background SVG Blobs - Large, edge-positioned, flowing off page */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Left edge blob - emerald/teal, top half */}
                <svg
                    className="absolute -left-[40%] top-[5%] w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] opacity-[0.12]"
                    viewBox="-500 -500 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
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
                        <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
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
                        <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
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
                        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    <path d={BLOB_PATHS.gamma} fill="url(#grad4)" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Bio Section */}
                <section className="px-8 py-16 md:py-24 max-w-4xl mx-auto">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-green-200/50 dark:border-green-800/50">
                        <h1 className="text-3xl md:text-4xl font-bold font-bbh-bartle text-zinc-900 dark:text-zinc-100 mb-6">
                            Software Engineering
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            I'm a software developer with experience across big
                            tech at{" "}
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                Microsoft
                            </span>{" "}
                            and{" "}
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                DoorDash
                            </span>
                            , as well as early-stage startups like{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">
                                Integrate
                            </span>
                            ,{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">
                                Story Health
                            </span>
                            , and{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">
                                Curie
                            </span>
                            . I hold a Bachelor's degree in Computer Science
                            from{" "}
                            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                                Texas A&M University
                            </span>
                            .
                        </p>
                        <TechStackFilter
                            selectedTech={selectedTech}
                            selectedTags={selectedTags}
                            onToggleTech={handleToggleTech}
                            onToggleTag={handleToggleTag}
                            numProjects={filteredProjects.length}
                        />
                    </div>
                </section>

                {/* Projects Section */}
                <section className="px-8 pb-24 space-y-24">
                    {filteredProjects.length === 0 ? (
                        <div className="max-w-7xl mx-auto text-center py-16">
                            <p className="text-lg text-zinc-600 dark:text-zinc-400">
                                No projects match the selected filters. Try
                                selecting different tech stack options.
                            </p>
                        </div>
                    ) : (
                        filteredProjects.map((project, index) => {
                            const layoutConfig = getProjectLayout(
                                project.id,
                                project.route,
                                project.url
                            );

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
                                            description: "lg:col-span-5",
                                            iframe: "lg:col-span-5",
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
                                            <SlideIn from={isEven ? "left" : "right"} className="space-y-6">
                                            <h2 className="text-xl md:text-2xl font-bold font-bbh-bartle text-zinc-900 dark:text-zinc-100 mb-4">
                                                {project.title}
                                            </h2>
                                            <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                {project.description}
                                            </p>
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                    Why I Built It
                                                </h3>
                                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                    {project.why}
                                                </p>
                                            </div>
                                            {project.normalizedTech.length >
                                                0 && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                        Technologies
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.normalizedTech.map(
                                                            (tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="px-3 py-1 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-full text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {project.normalizedTags.length >
                                                0 && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                        Tags
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.normalizedTags.map(
                                                            (tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 backdrop-blur-sm rounded-full text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            </SlideIn>
                                        </div>

                                        {/* Iframe/CTA Side */}
                                        {layoutConfig.layout === "no-iframe" ? (
                                            <div className="lg:col-span-5 order-1">
                                                <div className="w-full h-[400px] md:h-[600px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-xl">
                                                    <div className="text-center space-y-4 p-8">
                                                        <p className="text-zinc-600 dark:text-zinc-400">
                                                            External Project
                                                        </p>
                                                        <a
                                                            href={project.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors"
                                                        >
                                                            Visit Project →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : layoutConfig.layout ===
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
                                                                slideFrom={isEven ? "right" : "left"}
                                                            />
                                                        )
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
                                                        slideFrom={isEven ? "right" : "left"}
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
