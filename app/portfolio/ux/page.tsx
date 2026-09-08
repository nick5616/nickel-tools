"use client";

import React, { useState, useMemo } from "react";
import ProjectIframe from "@/components/ui/ProjectIframe";
import TechStackFilter, { type ViewMode } from "@/components/ui/TechStackFilter";
import {
    Technology,
    Tag,
    normalizeTechnology,
    normalizeTag,
} from "@/app/portfolio/techStack";
import { getContentBySurface } from "@/app/data/content";

// Single source of truth lives in app/data/content.ts — every entry tagged
// with surfaces: ["ux-portfolio", ...] shows up here automatically.
const projects = getContentBySurface("ux-portfolio").map((item) => ({
    id: item.id,
    title: item.title,
    description: item.portfolio?.description ?? item.description,
    why: item.portfolio?.why ?? "",
    tech: item.portfolio?.tech ?? [],
    tags: item.portfolio?.tags ?? [],
    route: item.type === "internal" ? item.route : undefined,
    url: item.type === "external" ? item.url : undefined,
    color: item.portfolio?.color,
    borderColor: item.portfolio?.borderColor,
    blobColor: item.portfolio?.blobColor,
}));

export default function UXPortfolioPage() {
    const [selectedTech, setSelectedTech] = useState<Set<Technology>>(
        new Set()
    );
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>("curated");

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

    const sortedTech = useMemo(() => {
        const counts = new Map<Technology, number>();
        for (const p of projectsWithNormalized) {
            for (const t of p.normalizedTech) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
    }, [projectsWithNormalized]);

    const sortedTags = useMemo(() => {
        const counts = new Map<Tag, number>();
        for (const p of projectsWithNormalized) {
            for (const t of p.normalizedTags) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
    }, [projectsWithNormalized]);

    // Filter projects based on selected tech and tags (inclusive OR logic)
    const filteredProjects = useMemo(() => {
        if (selectedTech.size === 0 && selectedTags.size === 0) {
            return projectsWithNormalized;
        }

        return projectsWithNormalized.filter((project) => {
            // Check if project has ANY of the selected technologies
            const matchesTech =
                selectedTech.size === 0 ||
                project.normalizedTech.some((tech) => selectedTech.has(tech));

            // Check if project has ANY of the selected tags
            const matchesTags =
                selectedTags.size === 0 ||
                project.normalizedTags.some((tag) => selectedTags.has(tag));

            // Project matches if it has any selected tech OR any selected tag
            return matchesTech || matchesTags;
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50 dark:from-yellow-800 dark:via-yellow-700 dark:to-amber-700">
            {/* Background SVG Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <svg
                    className="absolute top-20 left-10 w-96 h-96 opacity-20"
                    viewBox="0 0 400 400"
                >
                    <path
                        d="M200,200 Q250,150 300,200 T400,200 Q350,250 300,200 T200,200 Q150,150 100,200 T0,200 Q50,250 100,200 T200,200"
                        fill="#f59e0b"
                    />
                </svg>
                <svg
                    className="absolute top-1/3 right-20 w-80 h-80 opacity-15"
                    viewBox="0 0 400 400"
                >
                    <path
                        d="M200,200 Q180,120 200,40 Q220,120 280,80 Q260,160 200,200 Q120,240 40,200 Q120,180 200,200 Q280,220 360,200 Q280,220 200,200"
                        fill="#eab308"
                    />
                </svg>
                <svg
                    className="absolute bottom-1/4 left-1/4 w-72 h-72 opacity-25"
                    viewBox="0 0 400 400"
                >
                    <path
                        d="M200,200 Q240,160 280,200 Q240,240 200,200 Q160,160 120,200 Q160,240 200,200"
                        fill="#f97316"
                    />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Bio Section */}
                <section className="px-8 py-16 md:py-24 max-w-4xl mx-auto">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-amber-200/50 dark:border-amber-800/50">
                        <h1 className="text-4xl md:text-5xl font-bold font-bbh-bartle text-zinc-900 dark:text-zinc-100 mb-6">
                            UI/UX Designer
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            I design interfaces that are both beautiful and
                            functional. My approach combines user-centered
                            design principles with technical implementation,
                            creating experiences that feel intuitive and
                            delightful. I specialize in mobile-first design,
                            interactive experiences, and building design systems
                            that scale.
                        </p>
                    </div>
                </section>

                {/* Tech Stack Filter */}
                <section className="px-8 py-8 max-w-7xl mx-auto">
                    <TechStackFilter
                        selectedTech={selectedTech}
                        selectedTags={selectedTags}
                        onToggleTech={handleToggleTech}
                        onToggleTag={handleToggleTag}
                        sortedTech={sortedTech}
                        sortedTags={sortedTags}
                        numProjects={filteredProjects.length}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
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
                        filteredProjects.map((project, index) => (
                            <div key={project.id} className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                    {/* Description Side */}
                                    <div
                                        className={`space-y-6 order-2 ${
                                            index % 2 === 0
                                                ? "lg:order-1"
                                                : "lg:order-2"
                                        }`}
                                    >
                                        <div className="relative">
                                            {/* Background blob for this project */}
                                            <svg
                                                className="absolute -z-10 -top-10 -left-10 w-64 h-64 opacity-10"
                                                viewBox="0 0 400 400"
                                            >
                                                <path
                                                    d="M200,200 Q250,150 300,200 T400,200 Q350,250 300,200 T200,200 Q150,150 100,200 T0,200 Q50,250 100,200 T200,200"
                                                    fill={project.blobColor}
                                                />
                                            </svg>
                                            <h2 className="text-3xl md:text-4xl font-bold font-bbh-bartle text-zinc-900 dark:text-zinc-100 mb-4">
                                                {project.title}
                                            </h2>
                                        </div>
                                        <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            {project.description}
                                        </p>
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                Design Approach
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {project.why}
                                            </p>
                                        </div>
                                        {project.normalizedTech.length > 0 && (
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
                                        {project.normalizedTags.length > 0 && (
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
                                    </div>

                                    {/* Iframe Side */}
                                    <div
                                        className={`order-1 relative ${
                                            index % 2 === 0
                                                ? "lg:order-2"
                                                : "lg:order-1"
                                        }`}
                                    >
                                        {project.route ? (
                                            <ProjectIframe
                                                src={project.route}
                                                title={project.title}
                                            />
                                        ) : project.url?.includes(
                                              "github.com"
                                          ) ? (
                                            <div className="w-full h-[400px] md:h-[600px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-xl">
                                                <div className="text-center space-y-4 p-8">
                                                    <p className="text-zinc-600 dark:text-zinc-400">
                                                        External Project
                                                    </p>
                                                    <a
                                                        href={project.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-colors"
                                                    >
                                                        Visit Project →
                                                    </a>
                                                </div>
                                            </div>
                                        ) : project.url ? (
                                            <ProjectIframe
                                                src={project.url}
                                                title={project.title}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
}
