"use client";

import { useEffect, useRef } from "react";

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
    return [
        ...buildArc(p1, mid, depth - 1, spread * 0.6).slice(0, -1),
        ...buildArc(mid, p2, depth - 1, spread * 0.6),
    ];
}

function drawArc(
    ctx: CanvasRenderingContext2D,
    p1: Point2D, p2: Point2D,
    color: string, glowColor: string,
    spread: number, alpha = 1, lineWidth = 1.2
) {
    const pts = buildArc(p1, p2, 4, spread);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 14;
    ctx.shadowColor = glowColor;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
}

interface Spark { p1: Point2D; p2: Point2D; alpha: number; decay: number }
interface Node { x: number; y: number; phase: number; phaseY: number; speed: number; ampX: number; ampY: number }

export default function ElectricPlaceholder({ hovered }: { hovered: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const tRef = useRef(Math.random() * 100);
    const sparksRef = useRef<Spark[]>([]);
    const nodesRef = useRef<Node[]>([]);
    const hoveredRef = useRef(hovered);
    const visibleRef = useRef(false);

    useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            nodesRef.current = Array.from({ length: 5 }, (_, i) => ({
                x: canvas.width * (0.2 + (i / 4) * 0.6),
                y: canvas.height * (0.3 + Math.random() * 0.4),
                phase: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                speed: 0.003 + Math.random() * 0.004,
                ampX: canvas.width * (0.04 + Math.random() * 0.06),
                ampY: canvas.height * (0.05 + Math.random() * 0.08),
            }));
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const animate = () => {
            animRef.current = requestAnimationFrame(animate);
            if (!visibleRef.current) return;

            const speed = hoveredRef.current ? 0.022 : 0.010;
            tRef.current += speed;
            const t = tRef.current;
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return;

            ctx.clearRect(0, 0, w, h);

            const c1 = `hsl(140,100%,62%)`;
            const g1 = `hsl(140,100%,75%)`;
            const spreadMul = hoveredRef.current ? 1.6 : 1.0;

            // Border
            const mg = 3;
            const bSpread = Math.min(w, h) * 0.04 * spreadMul;
            drawArc(ctx, {x:mg,y:mg},   {x:w-mg,y:mg},   c1, g1, bSpread);
            drawArc(ctx, {x:w-mg,y:mg}, {x:w-mg,y:h-mg}, c1, g1, bSpread);
            drawArc(ctx, {x:w-mg,y:h-mg},{x:mg,y:h-mg},  c1, g1, bSpread);
            drawArc(ctx, {x:mg,y:h-mg}, {x:mg,y:mg},     c1, g1, bSpread);

            // Update nodes
            const nodes = nodesRef.current;
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.phase += n.speed;
                n.phaseY += n.speed * 0.7;
                n.x = w * (0.15 + 0.7 * (i / (nodes.length - 1))) + Math.sin(n.phase) * n.ampX;
                n.y = h * 0.5 + Math.sin(n.phaseY) * n.ampY;
            }

            // Fire sparks
            const sparkRate = hoveredRef.current ? 0.25 : 0.08;
            if (Math.random() < sparkRate && nodes.length >= 2) {
                const i = Math.floor(Math.random() * nodes.length);
                let j = Math.floor(Math.random() * (nodes.length - 1));
                if (j >= i) j++;
                sparksRef.current.push({
                    p1: { ...nodes[i] }, p2: { ...nodes[j] },
                    alpha: 0.8 + Math.random() * 0.2,
                    decay: 0.04 + Math.random() * 0.06,
                });
            }

            // Draw sparks
            sparksRef.current = sparksRef.current.filter(s => s.alpha > 0.02);
            for (const s of sparksRef.current) {
                const sp = Math.hypot(s.p2.x - s.p1.x, s.p2.y - s.p1.y) * 0.15 * spreadMul;
                drawArc(ctx, s.p1, s.p2, c1, g1, sp, s.alpha, 0.9);
                s.alpha -= s.decay;
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

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
        />
    );
}
