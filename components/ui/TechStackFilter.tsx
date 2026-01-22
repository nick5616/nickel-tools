"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TECHNOLOGIES, TAGS, Technology, Tag } from "@/app/portfolio/techStack";

interface TechStackFilterProps {
    selectedTech: Set<Technology>;
    selectedTags: Set<Tag>;
    onToggleTech: (tech: Technology) => void;
    onToggleTag: (tag: Tag) => void;
    numProjects: number;
}

export default function TechStackFilter({
    selectedTech,
    selectedTags,
    onToggleTech,
    onToggleTag,
    numProjects,
}: TechStackFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = selectedTech.size > 0 || selectedTags.size > 0;
    console.log("numProjects", numProjects);
    return (
        <div className="mt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left rounded-lg transition-colors pb-3"
            >
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Filter Projects
                    {hasActiveFilters && (
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            ({selectedTech.size + selectedTags.size} active)
                        </span>
                    )}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 rounded-lg space-y-6">
                    {/* Technologies Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                            Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TECHNOLOGIES.map((tech) => {
                                const isSelected = selectedTech.has(tech);
                                return (
                                    <button
                                        key={tech}
                                        onClick={() => onToggleTech(tech)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 shadow-md"
                                                : "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-green-400 dark:hover:border-green-600 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                                        }`}
                                    >
                                        {tech}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TAGS.map((tag) => {
                                const isSelected = selectedTags.has(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => onToggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md"
                                                : "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-white/80 dark:hover:bg-zinc-800/80"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    selectedTech.forEach((tech) =>
                                        onToggleTech(tech)
                                    );
                                    selectedTags.forEach((tag) =>
                                        onToggleTag(tag)
                                    );
                                }}
                                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                            >
                                Clear all filters
                            </button>
                            <div>
                                {numProjects} project
                                {numProjects === 1 ? "" : "s"} found
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
