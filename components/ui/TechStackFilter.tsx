"use client";

import React from "react";
import { TECH_STACK_OPTIONS, TechStackOption } from "@/app/portfolio/techStack";

interface TechStackFilterProps {
    selectedTech: Set<TechStackOption>;
    onToggleTech: (tech: TechStackOption) => void;
}

export default function TechStackFilter({
    selectedTech,
    onToggleTech,
}: TechStackFilterProps) {
    return (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                Filter by Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
                {TECH_STACK_OPTIONS.map((tech) => {
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
            {selectedTech.size > 0 && (
                <button
                    onClick={() => {
                        selectedTech.forEach((tech) => onToggleTech(tech));
                    }}
                    className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                >
                    Clear all filters
                </button>
            )}
        </div>
    );
}
