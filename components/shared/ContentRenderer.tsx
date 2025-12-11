"use client";

import React from "react";
import type { Content } from "@/app/data/content";
import dynamic from "next/dynamic";

// Lazy load internal app components
const ResumeEditor = dynamic(() => import("@/components/tools/resume-editor"), {
    loading: () => (
        <div className="p-4 text-zinc-400">Loading Resume Editor...</div>
    ),
    ssr: false,
});

const SmartPiano = dynamic(() => import("@/components/tools/smart-piano"), {
    loading: () => (
        <div className="p-4 text-zinc-400">Loading Smart Piano...</div>
    ),
    ssr: false,
});

const About = dynamic(() => import("@/components/tools/about"), {
    loading: () => <div className="p-4 text-zinc-400">Loading...</div>,
    ssr: false,
});

const Contact = dynamic(() => import("@/components/tools/contact"), {
    loading: () => <div className="p-4 text-zinc-400">Loading...</div>,
    ssr: false,
});

const Settings = dynamic(() => import("@/components/tools/settings"), {
    loading: () => <div className="p-4 text-zinc-400">Loading...</div>,
    ssr: false,
});

const ArtGallery = dynamic(() => import("@/components/tools/art-gallery"), {
    loading: () => <div className="p-4 text-zinc-400">Loading Gallery...</div>,
    ssr: false,
});

const PokemonOrTechnology = dynamic(
    () => import("@/components/tools/pokemon-or-technology"),
    {
        loading: () => <div className="p-4 text-zinc-400">Loading Game...</div>,
        ssr: false,
    }
);

const ChoicePicker = dynamic(() => import("@/components/tools/choice-picker"), {
    loading: () => (
        <div className="p-4 text-zinc-400">Loading Choice Picker...</div>
    ),
    ssr: false,
});

const AdvancedColorSchemeGenerator = dynamic(
    () => import("@/components/tools/advanced-color-scheme-generator"),
    {
        loading: () => (
            <div className="p-4 text-zinc-400">
                Loading Color Scheme Generator...
            </div>
        ),
        ssr: false,
    }
);

interface ContentRendererProps {
    content: Content;
}

export function ContentRenderer({ content }: ContentRendererProps) {
    switch (content.type) {
        case "external":
            // Special handling for GitHub links: don't try to embed in an iframe
            if (content.url.includes("github.com")) {
                return (
                    <div className="h-full w-full flex flex-col bg-[rgb(var(--bg-window))]">
                        <div className="p-6 border-b border-[rgb(var(--border-window))]">
                            <h1 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                                {content.title}
                            </h1>
                            <p className="mt-2 text-sm text-[rgb(var(--text-primary))]">
                                {content.description}
                            </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="max-w-md text-center">
                                <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
                                    This project is not web-based so I can't
                                    embed it here. Click the button below to
                                    open it directly on GitHub.
                                </p>
                                <a
                                    href={content.url}
                                    target={
                                        content.openInNewTab
                                            ? "_blank"
                                            : "_self"
                                    }
                                    rel={
                                        content.openInNewTab
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--bg-button))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-button-hover))] transition-colors"
                                >
                                    Go to GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="h-full w-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <iframe
                            src={content.url}
                            className="w-full h-full border-0"
                            title={content.title}
                        />
                    </div>
                </div>
            );

        case "internal":
            // Route to the appropriate internal component
            if (content.route === "/resume-editor") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <ResumeEditor />
                    </div>
                );
            }
            if (content.route === "/smart-piano") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <SmartPiano />
                    </div>
                );
            }
            if (content.route === "/about") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <About />
                    </div>
                );
            }
            if (content.route === "/contact") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <Contact />
                    </div>
                );
            }
            if (content.route === "/settings") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <Settings />
                    </div>
                );
            }
            if (content.route?.startsWith("/art-gallery/")) {
                const folder = content.route.split("/art-gallery/")[1] as
                    | "digital-art"
                    | "paintings"
                    | "sketches"
                    | "lefthanded"
                    | "miscellaneous"
                    | "notesappart";
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <ArtGallery folder={folder} />
                    </div>
                );
            }
            if (content.route === "/pokemon-or-technology") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <PokemonOrTechnology />
                    </div>
                );
            }
            if (content.route === "/choice-picker") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <ChoicePicker />
                    </div>
                );
            }
            if (content.route === "/advanced-color-scheme-generator") {
                return (
                    <div className="h-full w-full overflow-auto bg-[rgb(var(--bg-window))]">
                        <AdvancedColorSchemeGenerator />
                    </div>
                );
            }
            // Placeholder for other internal apps
            return (
                <div className="h-full w-full p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-[rgb(var(--text-secondary))] mb-2">
                            {content.title}
                        </p>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            {content.description}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-primary))] mt-4">
                            Coming soon...
                        </p>
                    </div>
                </div>
            );

        case "media":
            return (
                <div className="h-full w-full p-4">
                    {content.mediaType === "image" && (
                        <img
                            src={content.mediaUrl}
                            alt={content.title}
                            className="max-w-full max-h-full object-contain mx-auto"
                        />
                    )}
                    {content.mediaType === "video" && (
                        <video
                            src={content.mediaUrl}
                            controls
                            className="max-w-full max-h-full mx-auto"
                        />
                    )}
                </div>
            );

        case "collection":
            return (
                <div className="h-full w-full p-4">
                    <p className="text-zinc-400">Collection: {content.title}</p>
                    <p className="text-sm text-zinc-500 mt-2">
                        {content.description}
                    </p>
                </div>
            );

        default:
            return (
                <div className="h-full w-full p-4">
                    <p className="text-zinc-400">Unknown content type</p>
                </div>
            );
    }
}
