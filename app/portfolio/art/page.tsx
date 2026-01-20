"use client";

import React from "react";
import Link from "next/link";

const projects = [
    {
        id: "saucedog-art",
        title: "saucedog.art",
        description: "My digital art portfolio from 2022-2023, featuring a collection of digital illustrations, character designs, and creative experiments. A showcase of my journey exploring digital art and visual storytelling.",
        why: "I created saucedog.art as a dedicated space to showcase my digital art work. It represents a period of intense creative exploration where I was learning new techniques, developing my style, and creating pieces that combined my interests in technology and art.",
        tech: ["Digital Art", "Illustration", "Character Design", "Visual Storytelling"],
        url: "https://saucedog.art",
        color: "from-rose-500/20 to-pink-500/20",
        borderColor: "border-rose-400/30",
        blobColor: "#f43f5e",
    },
    {
        id: "art-digital-art",
        title: "Digital Art Gallery",
        description: "A curated collection of digital artwork created using various tools and techniques. From detailed illustrations to abstract compositions, this gallery showcases the breadth of my digital art practice.",
        why: "I wanted to create a dedicated space for my digital art pieces, separate from other mediums. Digital art allows for experimentation with color, composition, and style in ways that traditional media can't always achieve.",
        tech: ["Digital Illustration", "Procreate", "Photoshop", "Digital Painting"],
        route: "/art-gallery/digital-art",
        color: "from-orange-500/20 to-amber-500/20",
        borderColor: "border-orange-400/30",
        blobColor: "#f97316",
    },
    {
        id: "art-paintings",
        title: "Paintings",
        description: "Traditional paintings created with acrylics, watercolors, and other physical media. This collection represents my work with traditional art forms and the tactile experience of working with physical materials.",
        why: "Working with physical paint and canvas provides a different creative experience than digital art. These paintings capture moments of experimentation with color, texture, and form in a more traditional medium.",
        tech: ["Acrylic Paint", "Watercolor", "Traditional Media", "Canvas"],
        route: "/art-gallery/paintings",
        color: "from-red-500/20 to-rose-500/20",
        borderColor: "border-red-400/30",
        blobColor: "#ef4444",
    },
    {
        id: "art-sketches",
        title: "Sketches",
        description: "A collection of sketches, studies, and quick drawings. These pieces represent the foundation of my art practice—the raw ideas, experiments, and practice that inform my finished work.",
        why: "Sketches are where ideas start. I keep this collection to show the process behind finished pieces and to celebrate the value of quick, experimental work. Sometimes the best ideas come from these loose, unpolished drawings.",
        tech: ["Pencil", "Pen & Ink", "Charcoal", "Sketching"],
        route: "/art-gallery/sketches",
        color: "from-amber-500/20 to-yellow-500/20",
        borderColor: "border-amber-400/30",
        blobColor: "#f59e0b",
    },
];

const specialProjects = [
    {
        id: "art-lefthanded",
        title: "Left-Handed Art",
        description: "A unique collection of artwork created exclusively using my left hand. This constraint-based project explores how limitations can lead to creative breakthroughs and new artistic expressions.",
        route: "/art-gallery/lefthanded",
    },
    {
        id: "art-notesappart",
        title: "Notes App Art",
        description: "Art created in note-taking apps and other digital tools not typically used for art. These pieces embrace the limitations and unique qualities of these platforms.",
        route: "/art-gallery/notesappart",
    },
    {
        id: "art-miscellaneous",
        title: "Miscellaneous",
        description: "A collection of miscellaneous artwork and creative pieces that don't fit into other categories—experiments, one-offs, and creative explorations.",
        route: "/art-gallery/miscellaneous",
    },
];

export default function ArtPortfolioPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-pink-950 dark:via-rose-950 dark:to-orange-950">
            {/* Background SVG Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <svg className="absolute top-20 left-10 w-96 h-96 opacity-20" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q250,150 300,200 T400,200 Q350,250 300,200 T200,200 Q150,150 100,200 T0,200 Q50,250 100,200 T200,200"
                        fill="#f43f5e"
                    />
                </svg>
                <svg className="absolute top-1/3 right-20 w-80 h-80 opacity-15" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q180,120 200,40 Q220,120 280,80 Q260,160 200,200 Q120,240 40,200 Q120,180 200,200 Q280,220 360,200 Q280,220 200,200"
                        fill="#f97316"
                    />
                </svg>
                <svg className="absolute bottom-1/4 left-1/4 w-72 h-72 opacity-25" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q240,160 280,200 Q240,240 200,200 Q160,160 120,200 Q160,240 200,200"
                        fill="#ef4444"
                    />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Bio Section */}
                <section className="px-8 py-16 md:py-24 max-w-4xl mx-auto">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-pink-200/50 dark:border-pink-800/50">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                            Artist & Creative
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            My art practice spans digital illustration, traditional painting, and experimental mediums. I'm interested in the intersection of technology and art, exploring how digital tools can enhance traditional techniques and how constraints can spark creativity. My work often explores themes of identity, experimentation, and the playful side of creation.
                        </p>
                    </div>
                </section>

                {/* Main Projects Section */}
                <section className="px-8 pb-24 space-y-24">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            className="max-w-7xl mx-auto"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                {/* Description Side */}
                                <div
                                    className={`space-y-6 order-2 ${
                                        index % 2 === 0 ? "lg:order-1" : "lg:order-2"
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
                                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                                            {project.title}
                                        </h2>
                                    </div>
                                    <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {project.description}
                                    </p>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                            Creative Process
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            {project.why}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                            Mediums & Techniques
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="px-3 py-1 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-full text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Side */}
                                <div
                                    className={`order-1 relative ${
                                        index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                                    }`}
                                >
                                    <div
                                        className={`rounded-2xl ${project.color} ${project.borderColor} border-2 p-4 shadow-2xl backdrop-blur-sm`}
                                    >
                                        <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-inner">
                                            {project.route ? (
                                                <iframe
                                                    src={project.route}
                                                    className="w-full h-[600px] border-0"
                                                    title={project.title}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-[600px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                                                    <div className="text-center space-y-4 p-8">
                                                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                                            External Portfolio
                                                        </p>
                                                        <a
                                                            href={project.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-colors"
                                                        >
                                                            Visit Portfolio →
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Special Projects Grid */}
                <section className="px-8 pb-24">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-12 text-center">
                            Special Collections
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {specialProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={project.route}
                                    className="group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-pink-200/50 dark:border-pink-800/50 hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                        {project.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
