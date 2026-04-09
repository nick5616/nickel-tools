"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TECHNOLOGIES, TAGS, Technology, Tag } from "@/app/portfolio/techStack";

export type ViewMode = "curated" | "mobile" | "desktop";

interface TechStackFilterProps {
    selectedTech: Set<Technology>;
    selectedTags: Set<Tag>;
    onToggleTech: (tech: Technology) => void;
    onToggleTag: (tag: Tag) => void;
    numProjects: number;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export default function TechStackFilter({
    selectedTech,
    selectedTags,
    onToggleTech,
    onToggleTag,
    numProjects,
    viewMode,
    onViewModeChange,
}: TechStackFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = selectedTech.size > 0 || selectedTags.size > 0;

    return (
        <div className="mt-6">
            <div className="w-full flex items-center gap-3 pb-3">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-left rounded-lg transition-colors"
                >
                    <span className="text-sm font-semibold text-zinc-300">
                        Filter Projects
                        {hasActiveFilters && (
                            <span className="ml-2 text-xs text-zinc-400">
                                ({selectedTech.size + selectedTags.size} active)
                            </span>
                        )}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                </button>
                <div className="flex items-center gap-1 ml-auto">
                    {(["curated", "mobile", "desktop"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => onViewModeChange(mode)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all capitalize ${
                                viewMode === mode
                                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-sm"
                                    : "bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:border-green-600"
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 rounded-lg space-y-6">
                    {/* Technologies Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                            Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TECHNOLOGIES.map((tech) => {
                                const isSelected = selectedTech.has(tech);
                                return (
                                    <button
                                        key={tech}
                                        type="button"
                                        onClick={() => onToggleTech(tech)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 shadow-md"
                                                : "bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:border-green-600 hover:bg-zinc-800/80"
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
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TAGS.map((tag) => {
                                const isSelected = selectedTags.has(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => onToggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md"
                                                : "bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:border-blue-600 hover:bg-zinc-800/80"
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
                                type="button"
                                onClick={() => {
                                    selectedTech.forEach((tech) =>
                                        onToggleTech(tech)
                                    );
                                    selectedTags.forEach((tag) =>
                                        onToggleTag(tag)
                                    );
                                }}
                                className="text-sm text-zinc-400 hover:text-zinc-300 underline"
                            >
                                Clear all filters
                            </button>
                            <div className="text-zinc-300">
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
