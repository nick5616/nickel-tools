"use client";

import { useEffect, useRef, useState } from "react";

interface Point2D { x: number; y: number }


function buildArc(p1: Point2D, p2: Point2D, depth: number, spread: number): Point2D[] {
    if (depth === 0) return [p1, p2];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return [p1, p2];
    const offset = (Math.random() - 0.5) * spread;
    const mid: Point2D = { x: mx + (-dy / len) * offset, y: my + (dx / len) * offset };
    return [...buildArc(p1, mid, depth - 1, spread * 0.6).slice(0, -1), ...buildArc(mid, p2, depth - 1, spread * 0.6)];
}

function drawArcLine(
    ctx: CanvasRenderingContext2D,
    p1: Point2D, p2: Point2D,
    color: string, glowColor: string,
    spread: number, alpha = 1
) {
    const pts = buildArc(p1, p2, 4, spread);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = glowColor;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
}

interface LaserRoomPreviewProps {
    src?: string;
}

export default function LaserRoomPreview({ src }: LaserRoomPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>(0);
    const tRef = useRef(0);
    const hoveredRef = useRef(false);
    const clickPulseRef = useRef(0);
    const visibleRef = useRef(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showIframe, setShowIframe] = useState(false);

    // Canvas animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const animate = () => {
            animRef.current = requestAnimationFrame(animate);
            if (!visibleRef.current) return;

            const speed = hoveredRef.current ? 0.020 : 0.009;
            tRef.current += speed;
            const t = tRef.current;

            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            ctx.clearRect(0, 0, w, h);

            const cx = w / 2 + Math.sin(t * 0.61) * w * 0.09 + Math.sin(t * 0.23) * w * 0.035;
            const cy = h / 2 + Math.cos(t * 0.47) * h * 0.07 + Math.cos(t * 0.37) * h * 0.025;

            if (clickPulseRef.current > 0) clickPulseRef.current -= 0.035;
            const pulse = Math.max(0, clickPulseRef.current);
            const depthBase = 0.22 + Math.sin(t * 0.53) * 0.055 + Math.sin(t * 0.97) * 0.022;
            const depthScale = depthBase + pulse * 0.18 * Math.sin(pulse * Math.PI);

            const bw = w * depthScale;
            const bh = h * depthScale;

            const back: Record<string, Point2D> = {
                tl: { x: cx - bw / 2, y: cy - bh / 2 },
                tr: { x: cx + bw / 2, y: cy - bh / 2 },
                br: { x: cx + bw / 2, y: cy + bh / 2 },
                bl: { x: cx - bw / 2, y: cy + bh / 2 },
            };

            const c1 = `hsl(140,100%,62%)`;
            const g1 = `hsl(140,100%,75%)`;

            const spreadMul = hoveredRef.current ? 1.6 : 1.0;
            const bSpread = Math.min(w, h) * 0.04 * spreadMul;
            const mg = bSpread * 1.5;
            const front: Record<string, Point2D> = {
                tl: { x: mg, y: mg }, tr: { x: w - mg, y: mg },
                br: { x: w - mg, y: h - mg }, bl: { x: mg, y: h - mg },
            };
            drawArcLine(ctx, front.tl, front.tr, c1, g1, bSpread);
            drawArcLine(ctx, front.tr, front.br, c1, g1, bSpread);
            drawArcLine(ctx, front.br, front.bl, c1, g1, bSpread);
            drawArcLine(ctx, front.bl, front.tl, c1, g1, bSpread);

            const wallSpread = Math.min(bw, bh) * 0.12 * spreadMul;
            drawArcLine(ctx, back.tl, back.tr, c1, g1, wallSpread);
            drawArcLine(ctx, back.tr, back.br, c1, g1, wallSpread);
            drawArcLine(ctx, back.br, back.bl, c1, g1, wallSpread);
            drawArcLine(ctx, back.bl, back.tl, c1, g1, wallSpread);

            const tunnelSpread = Math.min(w, h) * 0.05 * spreadMul;
            drawArcLine(ctx, front.tl, back.tl, c1, g1, tunnelSpread);
            drawArcLine(ctx, front.tr, back.tr, c1, g1, tunnelSpread);
            drawArcLine(ctx, front.br, back.br, c1, g1, tunnelSpread);
            drawArcLine(ctx, front.bl, back.bl, c1, g1, tunnelSpread);

            // Cursor on the back wall — sized to fit inside the back rect, tip offset to center it visually
            const cSize = Math.min(bw, bh) * (0.72 + Math.sin(t * 0.73) * 0.04 + pulse * 0.12 * Math.sin(pulse * Math.PI));
            const cW = cSize * 0.60;
            const tipX = cx - cW * 0.25;
            const tipY = cy - cSize * 0.38;
            const cursorVerts: Point2D[] = [
                { x: tipX,              y: tipY },                       // tip
                { x: tipX - cW * 0.05,              y: tipY + cSize * 0.78 },        // bottom-left of body
                { x: tipX + cW * 0.33,  y: tipY + cSize * 0.58 },       // notch
                { x: tipX + cW * 0.76,  y: tipY + cSize },               // tail bottom (more vertical from notch)
                { x: tipX + cW * 0.9,  y: tipY + cSize * 0.8 },        // tail right (slightly less correction)
                { x: tipX + cW * 0.56,  y: tipY + cSize * 0.50 },        // above notch
                { x: tipX + cW,         y: tipY + cSize * 0.35 },        // right shoulder
            ];
            const cSpread = cSize * 0.028 * spreadMul;
            for (let i = 0; i < cursorVerts.length; i++) {
                drawArcLine(ctx, cursorVerts[i], cursorVerts[(i + 1) % cursorVerts.length], c1, g1, cSpread);
            }
        };

        animRef.current = requestAnimationFrame(animate);

        const io = new IntersectionObserver(
            ([entry]) => { visibleRef.current = entry.isIntersecting; },
            { threshold: 0.1 }
        );
        io.observe(canvas);

        return () => {
            cancelAnimationFrame(animRef.current);
            ro.disconnect();
            io.disconnect();
        };
    }, []);

    // Garbage-collect iframe after 5s out of view
    useEffect(() => {
        if (!showIframe) return;
        const container = containerRef.current;
        if (!container) return;

        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                hideTimerRef.current = setTimeout(() => {
                    setShowIframe(false);
                }, 5000);
            } else {
                if (hideTimerRef.current) {
                    clearTimeout(hideTimerRef.current);
                    hideTimerRef.current = null;
                }
            }
        }, { threshold: 0.1 });

        io.observe(container);
        return () => {
            io.disconnect();
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        };
    }, [showIframe]);

    return (
        <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: "400px" }}>
            {/* Canvas stays in DOM always so the useEffect setup remains valid.
                Hidden via display:none when iframe is active — no pointer-events leakage. */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                style={{ display: showIframe ? "none" : "block" }}
                onMouseEnter={() => { hoveredRef.current = true; }}
                onMouseLeave={() => { hoveredRef.current = false; }}
                onClick={() => {
                    clickPulseRef.current = 1.2;
                    setTimeout(() => setShowIframe(true), 120);
                }}
            />

            {showIframe && src && (
                <iframe
                    src={src}
                    title="Project preview"
                    className="absolute inset-0 w-full h-full border-0 z-20 rounded-lg"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
                />
            )}

            {!showIframe && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none z-30">
                    <span className="text-xs text-green-400/40 tracking-widest uppercase">
                        click to explore
                    </span>
                </div>
            )}
        </div>
    );
}
