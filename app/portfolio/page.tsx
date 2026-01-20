"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

export default function PortfolioPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showButtons, setShowButtons] = useState(false);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Initialize particles
        const particleCount = 50;
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
        }));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                // Move particle down
                particle.y += particle.speed;

                // Reset if off screen
                if (particle.y > canvas.height) {
                    particle.y = -10;
                    particle.x = Math.random() * canvas.width;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148, 163, 184, ${particle.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            // Show buttons after scrolling past 30% of viewport
            if (scrollY > windowHeight * 0.3) {
                setShowButtons(true);
            } else {
                setShowButtons(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
            {/* Particle Canvas - Fixed to viewport */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Main Content */}
            <div className="relative z-10">
                {/* Initial Question Section - Full viewport height, centered */}
                <section className="h-screen flex items-center justify-center px-8 ">
                    <div>
                        <h1
                            className="mb-[200px] text-6xl md:text-8xl font-bold text-center text-white"
                            style={{
                                animation: "fadeIn 1s ease-out",
                            }}
                        >
                            What do you want to know more about?
                        </h1>
                        {/* Scroll Indicator */}
                        <div className="left-1/2 transform -translate-x-1/2 animate-bounce">
                            <div className="flex flex-col items-center space-y-2 text-white/60">
                                <span className="text-sm">Scroll</span>
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Buttons Section - Full viewport height, centered */}
                <section
                    className={`h-screen flex items-center justify-center px-8 transition-opacity duration-1000 ${
                        showButtons ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                        <Link
                            href="/portfolio/ux"
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-blue-400/30 p-12 hover:scale-105 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10 text-center">
                                Design
                            </h2>
                        </Link>

                        <Link
                            href="/portfolio/software"
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-400/30 p-12 hover:scale-105 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10 text-center">
                                Software
                            </h2>
                        </Link>

                        <Link
                            href="/portfolio/art"
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-400/30 p-12 hover:scale-105 transition-transform duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10 text-center">
                                Art
                            </h2>
                        </Link>
                    </div>
                </section>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `,
                }}
            />
        </div>
    );
}
