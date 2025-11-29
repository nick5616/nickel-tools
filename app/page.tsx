"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    FileText,
    Search,
    ArrowUpRight,
    Gamepad2,
    Layers,
    BookOpen,
    Users,
    Palette,
    Cpu,
    Command,
} from "lucide-react";

import { PROJECTS, type Project } from "./constants";

export default function Home() {
    const [query, setQuery] = useState("");

    const filteredProjects = PROJECTS.filter(
        (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
        if (a.type === "EXTERNAL" && b.type !== "EXTERNAL") return 1;
        if (a.type !== "EXTERNAL" && b.type === "EXTERNAL") return -1;
        return 0;
    });

    return (
        // Base background handles light/dark automatically thanks to Layout
        <div className="min-h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                {/* HERO HEADER */}
                <header className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center font-bold text-xs font-mono rounded-sm shadow-md">
                                Ni
                            </div>
                            <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                                Element 28
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-600 dark:from-zinc-200 dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent">
                            NICKEL
                        </h1>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-lg">
                            A foundry for digital instruments, creative
                            experiments, and utility software.
                        </p>
                    </div>

                    {/* SEARCH MODULE */}
                    <div className="w-full lg:w-96">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 transition-colors">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="SEARCH DATABASE..."
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-11 pr-4 py-4 shadow-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all font-mono text-xs tracking-wider"
                                spellCheck="false"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Command
                                    size={12}
                                    className="text-zinc-300 dark:text-zinc-600"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* PROJECT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <MetalCard key={project.id} project={project} />
                    ))}

                    {/* Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="col-span-full py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg">
                            <p className="font-mono text-zinc-500 text-sm">
                                NO MATCHING ARTIFACTS FOUND.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetalCard({ project }: { project: Project }) {
    const isClickable =
        project.status !== "CONCEPT" && project.status !== "IN_DEVELOPMENT";
    const Wrapper = isClickable ? Link : "div";
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageWidth, setImageWidth] = useState<number | null>(null);
    const [imageHeight, setImageHeight] = useState<number | null>(null);

    const linkProps =
        project.type === "EXTERNAL"
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

    useEffect(() => {
        if (imageRef.current) {
            const updateDimensions = () => {
                if (imageRef.current) {
                    setImageWidth(imageRef.current.offsetWidth);
                    setImageHeight(imageRef.current.offsetHeight);
                }
            };
            updateDimensions();
            window.addEventListener("resize", updateDimensions);
            return () => window.removeEventListener("resize", updateDimensions);
        }
    }, [project.backgroundScreenshotPath]);

    // Calculate gradient based on image aspect ratio
    // Desktop (wider than tall): diagonal gradient (top-left transparent, bottom-right opaque)
    // Mobile (taller than wide): right-to-left gradient (right transparent, left opaque)
    const getGradientStyle = () => {
        if (!imageWidth || !imageHeight) {
            // Default gradient while loading
            return {
                maskImage:
                    "linear-gradient(to bottom right, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)",
                WebkitMaskImage:
                    "linear-gradient(to bottom right, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)",
            };
        }

        const aspectRatio = imageWidth / imageHeight;
        const isMobile = aspectRatio < 1; // Taller than wide

        if (isMobile) {
            // Mobile screenshots: left-to-right gradient
            // Left side: transparent (no image visible)
            // Right side: fully opaque (image fully visible)
            return {
                maskImage:
                    "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,1) 80%)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,1) 80%)",
            };
        } else {
            // Desktop screenshots: diagonal gradient
            // Top-left: completely transparent (no image visible)
            // Bottom-right: fully opaque (image fully visible)
            const cardHeight = 256;
            const widthRatio = imageWidth / cardHeight;

            let midOpacity = 0.3;
            if (widthRatio < 1.2) {
                // Narrower desktop image - show more of it earlier
                midOpacity = 0.5;
            } else if (widthRatio > 1.5) {
                // Wider desktop image - more aggressive fade from left
                midOpacity = 0.15;
            }

            return {
                maskImage: `linear-gradient(to bottom right, transparent 0%, rgba(0,0,0,${midOpacity}) 50%, rgba(0,0,0,1) 100%)`,
                WebkitMaskImage: `linear-gradient(to bottom right, transparent 0%, rgba(0,0,0,${midOpacity}) 50%, rgba(0,0,0,1) 100%)`,
            };
        }
    };

    return (
        <Wrapper
            href={project.href}
            {...linkProps}
            className={`
        group relative h-64 flex flex-col justify-between gap-2 p-8 overflow-hidden
        border transition-all duration-300
        /* LIGHT MODE STYLES */
        bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50
        /* DARK MODE STYLES */
        dark:bg-zinc-900 dark:border-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 dark:hover:shadow-black/50
        ${isClickable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
      `}
        >
            {/* BACKGROUND SCREENSHOT */}
            {project.backgroundScreenshotPath && (
                <div className="absolute inset-0 right-0 h-full w-full overflow-hidden">
                    <div
                        ref={imageRef}
                        className="absolute right-0 top-0 h-full w-auto"
                    >
                        <div
                            className="h-full w-auto relative"
                            style={getGradientStyle()}
                        >
                            <Image
                                src={project.backgroundScreenshotPath}
                                alt={project.name}
                                width={400}
                                height={256}
                                className="h-full w-auto object-cover object-right"
                                onLoad={() => {
                                    if (imageRef.current) {
                                        setImageWidth(
                                            imageRef.current.offsetWidth
                                        );
                                        setImageHeight(
                                            imageRef.current.offsetHeight
                                        );
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SHINE ANIMATION EFFECT */}
            {isClickable && (
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
            )}

            {/* TOP ROW */}
            <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                    <div
                        className="p-2 rounded-sm transition-colors border
          bg-zinc-50 border-zinc-100 text-zinc-500 group-hover:text-zinc-900 group-hover:border-zinc-300
          dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:group-hover:text-white dark:group-hover:border-zinc-600
        "
                    >
                        {project.icon}
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-1">
                        <span className="uppercase tracking-wider">
                            {project.category}
                        </span>
                        {project.type === "EXTERNAL" && (
                            <ArrowUpRight size={10} />
                        )}
                    </div>
                </div>
                <div className="mt-2">
                    <h3
                        className="text-xl font-bold mb-2 tracking-tight transition-colors
          text-zinc-900 group-hover:text-black
          dark:text-zinc-100 dark:group-hover:text-white
        "
                    >
                        {project.name}
                    </h3>
                    <p
                        className="text-sm font-light leading-relaxed transition-colors
          text-zinc-600 group-hover:text-zinc-800
          dark:text-zinc-500 dark:group-hover:text-zinc-400
        "
                    >
                        {project.subtitle}
                    </p>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="relative z-10">
                {/* Status Indicator */}
                <div className="mt-6 flex items-center gap-2">
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${
                            project.status === "OPERATIONAL"
                                ? "bg-emerald-500"
                                : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                    ></div>
                    <span
                        className={`text-[9px] font-mono tracking-widest uppercase ${
                            project.status === "OPERATIONAL"
                                ? "text-emerald-600 dark:text-emerald-500/80"
                                : "text-zinc-400 dark:text-zinc-600"
                        }`}
                    >
                        {project.status.replace("_", " ")}
                    </span>
                </div>
            </div>
        </Wrapper>
    );
}
