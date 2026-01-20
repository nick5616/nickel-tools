"use client";

import React from "react";

const projects = [
    {
        id: "resume-builder",
        title: "Online LaTeX Resume Builder",
        description: "A privacy-first resume builder that compiles LaTeX directly in your browser using WebAssembly. No server-side processing, no data collection—just you and your resume.",
        why: "I built this because I was frustrated with resume builders that required accounts, stored your data, or had limited formatting options. LaTeX produces beautiful, professional resumes, but the setup barrier is high. This tool removes that barrier entirely.",
        tech: ["TypeScript", "React", "WebAssembly", "LaTeX", "Next.js"],
        route: "/resume-editor",
        color: "from-emerald-500/20 to-teal-500/20",
        borderColor: "border-emerald-400/30",
        blobColor: "#10b981",
    },
    {
        id: "smart-piano",
        title: "Smart Piano",
        description: "An intelligent web-based piano that analyzes musical context and suggests harmonically appropriate next notes based on the key you're playing in.",
        why: "I wanted to create a tool that helps people learn music theory through play. Instead of just showing scales or chords, Smart Piano provides real-time musical guidance, making it easier to create pleasing melodies even if you're not an expert musician.",
        tech: ["TypeScript", "React", "Web Audio API", "Music Theory Algorithms", "Next.js"],
        route: "/smart-piano",
        color: "from-cyan-500/20 to-blue-500/20",
        borderColor: "border-cyan-400/30",
        blobColor: "#06b6d4",
    },
    {
        id: "batch-analyzer",
        title: "Batch Analyzer",
        description: "A tool that batch processes product images by sending the same queries to each image in a batch using Large Language Models. Perfect for e-commerce teams analyzing product catalogs at scale.",
        why: "While working on product analysis tasks, I found myself repeatedly asking the same questions about different images. This tool automates that workflow, allowing teams to analyze entire product catalogs efficiently with custom LLM integrations.",
        tech: ["TypeScript", "React", "LLM APIs", "Image Processing", "Batch Processing"],
        url: "https://batch-analyzer.netlify.app/",
        color: "from-violet-500/20 to-purple-500/20",
        borderColor: "border-violet-400/30",
        blobColor: "#8b5cf6",
    },
    {
        id: "chaos",
        title: "CHAOS",
        description: "Counter-Strike Highlight Analysis and Organization System. A desktop application that batch processes video game footage and automatically identifies noteworthy moments using machine learning (OCR and Speech-to-Text).",
        why: "As a Counter-Strike player, I wanted to automatically find and organize my best plays from hours of gameplay footage. Manually scrubbing through videos is tedious, so I built CHAOS to use ML to detect kills, callouts, and other significant moments automatically.",
        tech: ["Python", "Machine Learning", "OCR", "Speech-to-Text", "Video Processing", "Computer Vision"],
        url: "https://github.com/nick5616/CHAOS",
        color: "from-rose-500/20 to-pink-500/20",
        borderColor: "border-rose-400/30",
        blobColor: "#f43f5e",
    },
];

export default function SoftwarePortfolioPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-green-950 dark:via-teal-950 dark:to-cyan-950">
            {/* Background SVG Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <svg className="absolute top-20 left-10 w-96 h-96 opacity-20" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q250,150 300,200 T400,200 Q350,250 300,200 T200,200 Q150,150 100,200 T0,200 Q50,250 100,200 T200,200"
                        fill="#10b981"
                    />
                </svg>
                <svg className="absolute top-1/3 right-20 w-80 h-80 opacity-15" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q180,120 200,40 Q220,120 280,80 Q260,160 200,200 Q120,240 40,200 Q120,180 200,200 Q280,220 360,200 Q280,220 200,200"
                        fill="#06b6d4"
                    />
                </svg>
                <svg className="absolute bottom-1/4 left-1/4 w-72 h-72 opacity-25" viewBox="0 0 400 400">
                    <path
                        d="M200,200 Q240,160 280,200 Q240,240 200,200 Q160,160 120,200 Q160,240 200,200"
                        fill="#8b5cf6"
                    />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Bio Section */}
                <section className="px-8 py-16 md:py-24 max-w-4xl mx-auto">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-green-200/50 dark:border-green-800/50">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                            Software Developer
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            I'm a software developer with experience across big tech at{" "}
                            <span className="font-semibold text-green-600 dark:text-green-400">Microsoft</span> and{" "}
                            <span className="font-semibold text-green-600 dark:text-green-400">DoorDash</span>, as well as early-stage startups like{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">Integrate</span>,{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">Story Health</span>, and{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">Curie</span>. I hold a Bachelor's degree in Computer Science from{" "}
                            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Texas A&M University</span>.
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
                                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                                            {project.title}
                                        </h2>
                                    </div>
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
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                            Tech Stack
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
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
