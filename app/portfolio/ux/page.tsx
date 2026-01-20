"use client";

import React from "react";

const projects = [
    {
        id: "color-engine",
        title: "Advanced Color Scheme Generator",
        description: "An algorithmic color palette generator based on harmonic color theory. Create beautiful, mathematically sound color schemes and export them as theme JSON for use in design systems and applications.",
        why: "I built this because I was tired of manually creating color palettes and wanted a tool that could generate harmonious color schemes based on established color theory principles. It's particularly useful for creating accessible, visually pleasing design systems with proper contrast ratios.",
        tech: ["TypeScript", "React", "Color Theory Algorithms", "Canvas API", "Next.js"],
        route: "/advanced-color-scheme-generator",
        color: "from-indigo-500/20 to-purple-500/20",
        borderColor: "border-indigo-400/30",
        blobColor: "#6366f1",
    },
    {
        id: "portfolio",
        title: "nicolasbelovoskey.com",
        description: "An immersive first-person portfolio experience built in Three.js. Navigate through a 3D space to explore my work, with interactive games and experiences integrated throughout the journey.",
        why: "I wanted to create a portfolio that was more than just a collection of links. The first-person 3D experience makes exploring my work feel like an adventure, and it showcases both my technical skills and creative vision in one cohesive experience.",
        tech: ["Three.js", "WebGL", "JavaScript", "3D Design", "Interactive Design"],
        url: "https://nicolasbelovoskey.com",
        color: "from-violet-500/20 to-fuchsia-500/20",
        borderColor: "border-violet-400/30",
        blobColor: "#8b5cf6",
    },
    {
        id: "friendex",
        title: "friendex.online",
        description: "A pokédex for your friends—a mobile-first social app that lets you collect and organize information about the people in your life. Built with a focus on delightful mobile interactions and intuitive navigation.",
        why: "I created friendex because I wanted a fun, gamified way to remember details about friends. The pokédex metaphor makes it engaging, and the mobile-first design ensures it's easy to use on the go when you're actually with people.",
        tech: ["React", "Mobile-First Design", "Responsive UI", "Social UX"],
        url: "https://friendex.online",
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-400/30",
        blobColor: "#3b82f6",
    },
    {
        id: "tierlistify",
        title: "tierlistify.com",
        description: "A mobile-optimized tier list maker that makes ranking anything quick and intuitive. Built specifically to address the pain points of existing tier list tools on mobile devices.",
        why: "I built tierlistify because I was frustrated with how poorly existing tier list tools worked on mobile. I wanted to create something that felt native to touch interfaces, with smooth drag-and-drop interactions and a clean, focused UI.",
        tech: ["React", "Mobile UX", "Touch Interactions", "Drag & Drop", "Progressive Web App"],
        url: "https://tierlistify.com",
        color: "from-purple-500/20 to-pink-500/20",
        borderColor: "border-purple-400/30",
        blobColor: "#a855f7",
    },
];

export default function UXPortfolioPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50 dark:from-yellow-800 dark:via-yellow-700 dark:to-amber-700">
            {/* Background SVG Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <svg className="absolute top-20 left-10 w-96 h-96 opacity-20" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q250,150 300,200 T400,200 Q350,250 300,200 T200,200 Q150,150 100,200 T0,200 Q50,250 100,200 T200,200"
                        fill="#f59e0b"
                    />
                </svg>
                <svg className="absolute top-1/3 right-20 w-80 h-80 opacity-15" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q180,120 200,40 Q220,120 280,80 Q260,160 200,200 Q120,240 40,200 Q120,180 200,200 Q280,220 360,200 Q280,220 200,200"
                        fill="#eab308"
                    />
                </svg>
                <svg className="absolute bottom-1/4 left-1/4 w-72 h-72 opacity-25" viewBox="0 0 400 400">
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
                            I design interfaces that are both beautiful and functional. My approach combines user-centered design principles with technical implementation, creating experiences that feel intuitive and delightful. I specialize in mobile-first design, interactive experiences, and building design systems that scale.
                        </p>
                    </div>
                </section>

                {/* Projects Section */}
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
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                            Technologies & Tools
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

                                {/* Iframe Side */}
                                <div
                                    className={`order-1 relative ${
                                        index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                                    }`}
                                >
                                    {project.route ? (
                                        <iframe
                                            src={project.route}
                                            className="w-full h-[600px] border-0 rounded-lg shadow-xl"
                                            title={project.title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-[600px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-xl">
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
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
