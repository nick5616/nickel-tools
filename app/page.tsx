"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Point2D = { x: number; y: number };

function buildArc(
    p1: Point2D,
    p2: Point2D,
    depth: number,
    spread: number
): Point2D[] {
    if (depth === 0) return [p1, p2];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return [p1, p2];
    const offset = (Math.random() - 0.5) * spread;
    const mid: Point2D = {
        x: mx + (-dy / len) * offset,
        y: my + (dx / len) * offset,
    };
    return [
        ...buildArc(p1, mid, depth - 1, spread * 0.6).slice(0, -1),
        ...buildArc(mid, p2, depth - 1, spread * 0.6),
    ];
}

function drawArc(
    ctx: CanvasRenderingContext2D,
    p1: Point2D,
    p2: Point2D,
    spread: number,
    alpha: number
) {
    const pts = buildArc(p1, p2, 4, spread);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = `hsl(140,100%,62%)`;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 14;
    ctx.shadowColor = `hsl(140,100%,75%)`;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    phase: number;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<Point2D>({ x: -9999, y: -9999 });
    const particlesRef = useRef<Particle[]>([]);
    const animRef = useRef<number>(0);
    const tRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const initParticles = () => {
            const w = canvas.width;
            const h = canvas.height;
            const count = Math.max(28, Math.min(70, Math.floor((w * h) / 14000)));
            particlesRef.current = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: Math.random() * 1.8 + 0.8,
                phase: Math.random() * Math.PI * 2,
            }));
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        resize();
        window.addEventListener("resize", resize);

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const onMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);

        const MAX_DIST = 190;
        const CURSOR_PULL = 270;

        const animate = () => {
            animRef.current = requestAnimationFrame(animate);
            tRef.current += 0.009;
            const t = tRef.current;

            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const mouse = mouseRef.current;
            const particles = particlesRef.current;

            // Update particles
            for (const p of particles) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CURSOR_PULL && dist > 0) {
                    const force = (1 - dist / CURSOR_PULL) * 0.018;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
                p.vx *= 0.975;
                p.vy *= 0.975;
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x += w;
                if (p.x > w) p.x -= w;
                if (p.y < 0) p.y += h;
                if (p.y > h) p.y -= h;
            }

            // Draw arcs between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > MAX_DIST) continue;

                    const midX = (a.x + b.x) / 2;
                    const midY = (a.y + b.y) / 2;
                    const mdx = mouse.x - midX;
                    const mdy = mouse.y - midY;
                    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    const cursorBoost =
                        mDist < CURSOR_PULL ? (1 - mDist / CURSOR_PULL) : 0;

                    const baseAlpha = (1 - dist / MAX_DIST) * 0.45;
                    const alpha = Math.min(0.95, baseAlpha + cursorBoost * 0.7);
                    const spread = dist * 0.12 * (1 + cursorBoost * 2.5);

                    drawArc(ctx, a, b, spread, alpha);
                }
            }

            // Draw arcs from cursor to nearby particles
            if (mouse.x > -1000) {
                for (const p of particles) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > CURSOR_PULL * 0.6) continue;
                    const alpha = (1 - dist / (CURSOR_PULL * 0.6)) * 0.8;
                    const spread = dist * 0.18;
                    drawArc(ctx, mouse, p, spread, alpha);
                }
            }

            // Draw glowing particle nodes
            for (const p of particles) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const proximity =
                    dist < CURSOR_PULL ? (1 - dist / CURSOR_PULL) : 0;
                const pulse =
                    0.5 + 0.5 * Math.sin(t * 1.8 + p.phase);

                ctx.save();
                ctx.beginPath();
                ctx.arc(
                    p.x,
                    p.y,
                    p.radius * (1 + proximity * 2.5 + pulse * 0.4),
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `hsl(140,100%,70%)`;
                ctx.shadowBlur = 8 + proximity * 22 + pulse * 6;
                ctx.shadowColor = `hsl(140,100%,62%)`;
                ctx.globalAlpha = 0.35 + proximity * 0.65 + pulse * 0.1;
                ctx.fill();
                ctx.restore();
            }

            // Cursor glow
            if (mouse.x > -1000) {
                const grad = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, 80
                );
                grad.addColorStop(0, `hsla(140,100%,62%,0.18)`);
                grad.addColorStop(1, `hsla(140,100%,62%,0)`);
                ctx.save();
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-green-950 via-teal-950 to-cyan-950 overflow-hidden flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />

            <div className="relative z-10 text-center space-y-10 px-6 max-w-4xl mx-auto">
                {/* Name */}
                <div className="space-y-4">
                    <h1 className="text-2xl md:text-4xl lg:text-7xl font-bold font-bbh-bartle text-zinc-100 tracking-tight leading-none">
                        Nicole Belovoskey
                    </h1>
                    <p className="text-sm md:text-base text-green-400/70 tracking-[0.3em] uppercase">
                        Developer &nbsp;·&nbsp; Designer &nbsp;·&nbsp; Creator
                    </p>
                </div>

                {/* Nav cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <Link
                        href="/portfolio"
                        className="group relative p-6 bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-green-800/40 hover:border-green-500/60 transition-all duration-300 hover:bg-zinc-900/90 text-left overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <h2 className="text-sm md:text-lg lg:text-xl font-semibold font-bbh-bartle text-zinc-100 mb-1 group-hover:text-green-300 transition-colors duration-200">
                            Portfolio
                        </h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Software engineering, interactive design, and art
                        </p>
                        <span className="absolute bottom-4 right-4 text-green-500/30 group-hover:text-green-400/70 transition-colors duration-200 text-lg">
                            →
                        </span>
                    </Link>

                    <Link
                        href="/desktop"
                        className="group relative p-6 bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-teal-800/40 hover:border-teal-500/60 transition-all duration-300 hover:bg-zinc-900/90 text-left overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <h2 className="text-sm md:text-lg lg:text-xl font-semibold font-bbh-bartle text-zinc-100 mb-1 group-hover:text-teal-300 transition-colors duration-200">
                            Desktop
                        </h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            An OS in the browser — tools, apps, and experiments
                        </p>
                        <span className="absolute bottom-4 right-4 text-teal-500/30 group-hover:text-teal-400/70 transition-colors duration-200 text-lg">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
