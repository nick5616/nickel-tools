"use client";

import React, { useEffect, useRef } from "react";
import { useSystemStore, type WallpaperId } from "@/app/store/systemStore";
import { THEME_CHANGE_EVENT } from "@/app/utils/themeUtils";
import { paletteColor } from "@/app/utils/nickelPalette";

interface WallpaperProps {
    // Override the user's wallpaper (used by previews in the pickers)
    variant?: WallpaperId;
    // Thumbnails: no animation, no listeners
    preview?: boolean;
    className?: string;
}

// Wallpapers are the background role: every palette color here uses
// paletteColor(slot, "bg"). Marks drawn on top of them (arcs, lattice nodes)
// use the foreground role. Depth comes from white/black light overlays only,
// so the scheme's saturation and lightness stay intact.
const LIGHT = (alpha: number) => `rgb(255 255 255 / ${alpha})`;
const SHADE = (alpha: number) => `rgb(0 0 0 / ${alpha})`;

export function Wallpaper({ variant, preview = false, className = "" }: WallpaperProps) {
    const selected = useSystemStore((s) => s.wallpaper);
    const id = variant ?? selected;

    return (
        <div
            aria-hidden
            className={`absolute inset-0 overflow-hidden pointer-events-none bg-[rgb(var(--bg-desktop))] ${className}`}
        >
            {id === "aurora" && <Aurora preview={preview} />}
            {id === "plated" && <Plated preview={preview} />}
            {id === "lattice" && <Lattice preview={preview} />}
            {id === "arc" && <Arc preview={preview} />}
            <div className="nk-grain" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Aurora — large blurred palette blobs drifting slowly
// ---------------------------------------------------------------------------

const AURORA_BLOBS = [
    { slot: 2, left: "45%", top: "-20%", size: "58%", drift: "38s", dx: "-12vw", dy: "10vh", dy2: "6vh" },
    { slot: 3, left: "30%", top: "45%", size: "70%", drift: "52s", dx: "8vw", dy: "-10vh", dy2: "4vh" },
    { slot: 4, left: "-15%", top: "55%", size: "55%", drift: "60s", dx: "14vw", dy: "-6vh", dy2: "-8vh" },
    { slot: 1, left: "-10%", top: "-15%", size: "62%", drift: "46s", dx: "10vw", dy: "8vh", dy2: "-4vh" },
];

function Aurora({ preview }: { preview: boolean }) {
    return (
        <>
            <div
                className="absolute inset-0"
                style={{ background: paletteColor(1, "bg") }}
            />
            {AURORA_BLOBS.map((blob, i) => (
                <div
                    key={i}
                    className="nk-wall-blob"
                    style={
                        {
                            left: blob.left,
                            top: blob.top,
                            width: blob.size,
                            aspectRatio: "1",
                            background: paletteColor(blob.slot, "bg"),
                            filter: preview ? "blur(14px)" : undefined,
                            animation: preview ? "none" : undefined,
                            "--drift": blob.drift,
                            "--dx": blob.dx,
                            "--dy": blob.dy,
                            "--dy2": blob.dy2,
                        } as React.CSSProperties
                    }
                />
            ))}
            {/* Light from above, shade below: depth without touching S/L */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(90% 60% at 30% 0%, ${LIGHT(0.14)}, transparent 70%),
                        radial-gradient(100% 70% at 70% 110%, ${SHADE(0.18)}, transparent 70%)`,
                }}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Plated — brushed nickel tinted by the palette, sheen follows the light
// ---------------------------------------------------------------------------

function Plated({ preview }: { preview: boolean }) {
    return (
        <>
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(115deg,
                        ${paletteColor(1, "bg")} 0%,
                        ${paletteColor(2, "bg")} 34%,
                        ${paletteColor(1, "bg")} 52%,
                        ${paletteColor(3, "bg")} 74%,
                        ${paletteColor(4, "bg")} 100%)`,
                }}
            />
            {/* Metallic banding — light and shade, not color */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(115deg,
                        ${SHADE(0.16)} 0%, ${LIGHT(0.16)} 30%, ${SHADE(0.06)} 46%,
                        ${LIGHT(0.12)} 64%, ${SHADE(0.14)} 82%, ${LIGHT(0.06)} 100%)`,
                }}
            />
            {/* Brushed hairlines */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgb(0 0 0 / 0.04) 0 1px, transparent 1px 7px)",
                }}
            />
            {/* Specular sheen */}
            <div
                className="absolute inset-0"
                style={{
                    mixBlendMode: "overlay",
                    background: preview
                        ? "radial-gradient(60% 50% at 40% 30%, rgb(255 255 255 / 0.5), transparent 70%)"
                        : "radial-gradient(55% 45% at calc(50% + var(--light-x) * 35%) calc(35% + var(--light-y) * 25%), rgb(255 255 255 / 0.55), transparent 70%)",
                }}
            />
            {!preview && <ElementMark />}
        </>
    );
}

// ---------------------------------------------------------------------------
// Lattice — nickel's FCC crystal seen down the (111) axis, with parallax
// ---------------------------------------------------------------------------

function Lattice({ preview }: { preview: boolean }) {
    const patternId = `nk-lattice-${React.useId().replace(/:/g, "")}`;
    const w = 64;
    const h = Math.round(64 * Math.sqrt(3)); // 111
    return (
        <>
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(70% 60% at 20% 15%, ${paletteColor(2, "bg")}, transparent 70%),
                        radial-gradient(60% 60% at 85% 80%, ${paletteColor(3, "bg")}, transparent 70%),
                        ${paletteColor(1, "bg")}`,
                }}
            />
            <svg
                className="absolute"
                style={{
                    inset: preview ? 0 : -24,
                    width: preview ? "100%" : "calc(100% + 48px)",
                    height: preview ? "100%" : "calc(100% + 48px)",
                    transform: preview
                        ? undefined
                        : "translate(calc(var(--light-x) * -14px), calc(var(--light-y) * -14px))",
                }}
            >
                <defs>
                    <pattern
                        id={patternId}
                        width={w}
                        height={h}
                        patternUnits="userSpaceOnUse"
                        patternTransform={preview ? "scale(0.35)" : undefined}
                    >
                        <g
                            style={{ stroke: paletteColor(2, "fg", 0.22) }}
                            strokeWidth="1"
                        >
                            <line x1="0" y1="0" x2={w} y2="0" />
                            <line x1="0" y1={h / 2} x2={w} y2={h / 2} />
                            <line x1="0" y1="0" x2={w / 2} y2={h / 2} />
                            <line x1={w} y1="0" x2={w / 2} y2={h / 2} />
                            <line x1={w / 2} y1={h / 2} x2="0" y2={h} />
                            <line x1={w / 2} y1={h / 2} x2={w} y2={h} />
                        </g>
                        {[
                            [0, 0],
                            [w, 0],
                            [w / 2, h / 2],
                            [0, h],
                            [w, h],
                        ].map(([cx, cy], i) => (
                            <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r="2.6"
                                style={{ fill: paletteColor(i % 2 ? 3 : 1, "fg") }}
                                fillOpacity="0.7"
                            />
                        ))}
                    </pattern>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${patternId})`}
                />
            </svg>
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(80% 70% at 50% 50%, transparent 40%, ${SHADE(0.22)})`,
                }}
            />
            {!preview && <ElementMark />}
        </>
    );
}

// The engraved Ni tile in the corner of the metal wallpapers.
function ElementMark() {
    return (
        <div
            className="absolute right-[4vw] bottom-[14vh] select-none font-sans font-black tracking-tight leading-none text-right"
            style={{
                color: "rgb(var(--text-primary) / 0.08)",
                textShadow:
                    "0 1px 0 rgb(255 255 255 / 0.08), 0 -1px 0 rgb(0 0 0 / 0.12)",
            }}
        >
            <div className="text-[2.2vw] font-mono">28</div>
            <div className="text-[13vw]">Ni</div>
            <div className="text-[1.4vw] font-mono tracking-[0.4em]">
                58.693
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Arc — the homepage's electric arcs, recolored by the palette
// ---------------------------------------------------------------------------

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    phase: number;
}

function readPalette() {
    const style = getComputedStyle(document.documentElement);
    const num = (name: string, fallback: number) =>
        parseFloat(style.getPropertyValue(name)) || fallback;
    // Arcs and atoms are foreground-role marks on a background-role field.
    return {
        h1: num("--nk-h1", 122),
        h2: num("--nk-h2", 152),
        s: num("--nk-s", 42),
        fgL: num("--nk-fg-l", 30),
    };
}

function Arc({ preview }: { preview: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const reduced =
            preview ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let palette = readPalette();
        let particles: Particle[] = [];
        const mouse = { x: -9999, y: -9999 };
        let frame = 0;
        let t = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            const count = Math.max(
                preview ? 10 : 24,
                Math.min(56, Math.floor((rect.width * rect.height) / 18000))
            );
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.6 + 0.8,
                phase: Math.random() * Math.PI * 2,
            }));
        };

        const arcPoints = (
            ax: number,
            ay: number,
            bx: number,
            by: number,
            spread: number,
            depth: number
        ): number[] => {
            if (depth === 0) return [ax, ay, bx, by];
            const dx = bx - ax;
            const dy = by - ay;
            const len = Math.hypot(dx, dy) || 1;
            const off = (Math.random() - 0.5) * spread;
            const mx = (ax + bx) / 2 + (-dy / len) * off;
            const my = (ay + by) / 2 + (dx / len) * off;
            const left = arcPoints(ax, ay, mx, my, spread * 0.6, depth - 1);
            const right = arcPoints(mx, my, bx, by, spread * 0.6, depth - 1);
            return [...left.slice(0, -2), ...right];
        };

        const drawArc = (
            ax: number,
            ay: number,
            bx: number,
            by: number,
            spread: number,
            alpha: number
        ) => {
            const pts = arcPoints(ax, ay, bx, by, spread, 4);
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
            ctx.globalAlpha = alpha;
            ctx.stroke();
        };

        const MAX_DIST = 180;
        const PULL = 260;

        const draw = () => {
            t += 0.009;
            const { width: w, height: h } = canvas;
            ctx.clearRect(0, 0, w, h);
            const arcColor = `hsl(${palette.h1} ${palette.s}% ${palette.fgL}%)`;
            const nodeColor = `hsl(${palette.h2} ${palette.s}% ${palette.fgL}%)`;

            for (const p of particles) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const d = Math.hypot(dx, dy);
                if (d < PULL && d > 0) {
                    const f = (1 - d / PULL) * 0.016;
                    p.vx += (dx / d) * f;
                    p.vy += (dy / d) * f;
                }
                p.vx *= 0.975;
                p.vy *= 0.975;
                p.x = (p.x + p.vx + w) % w;
                p.y = (p.y + p.vy + h) % h;
            }

            ctx.save();
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 12;
            ctx.shadowColor = arcColor;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const d = Math.hypot(b.x - a.x, b.y - a.y);
                    if (d > MAX_DIST) continue;
                    const md = Math.hypot(
                        mouse.x - (a.x + b.x) / 2,
                        mouse.y - (a.y + b.y) / 2
                    );
                    const boost = md < PULL ? 1 - md / PULL : 0;
                    drawArc(
                        a.x,
                        a.y,
                        b.x,
                        b.y,
                        d * 0.12 * (1 + boost * 2.5),
                        Math.min(0.9, (1 - d / MAX_DIST) * 0.4 + boost * 0.6)
                    );
                }
            }
            ctx.restore();

            ctx.save();
            ctx.fillStyle = nodeColor;
            ctx.shadowColor = nodeColor;
            for (const p of particles) {
                const d = Math.hypot(mouse.x - p.x, mouse.y - p.y);
                const near = d < PULL ? 1 - d / PULL : 0;
                const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + p.phase);
                ctx.shadowBlur = 8 + near * 20;
                ctx.globalAlpha = 0.4 + near * 0.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * (1 + near * 2 + pulse * 0.4), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const loop = () => {
            frame = requestAnimationFrame(loop);
            if (document.hidden) return;
            draw();
        };

        const onPointerMove = (e: PointerEvent) => {
            // Windows sit above the wallpaper; don't stir it through them
            if ((e.target as Element | null)?.closest?.(".nk-window")) {
                onPointerLeave();
                return;
            }
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const onPointerLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };
        const onThemeChange = () => {
            palette = readPalette();
            if (reduced) draw();
        };

        resize();
        if (reduced) {
            draw();
        } else {
            loop();
            window.addEventListener("pointermove", onPointerMove, { passive: true });
            document.addEventListener("pointerleave", onPointerLeave);
        }
        window.addEventListener("resize", resize);
        window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
        // next-themes flips the .dark class without a theme-engine event
        const observer = new MutationObserver(onThemeChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerleave", onPointerLeave);
            window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
        };
    }, [preview]);

    return (
        <>
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(90% 80% at 30% 20%, ${paletteColor(2, "bg")}, transparent 70%),
                        radial-gradient(80% 80% at 80% 90%, ${paletteColor(3, "bg")}, transparent 70%),
                        ${paletteColor(1, "bg")}`,
                }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </>
    );
}
