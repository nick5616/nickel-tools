"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MousePointerClick } from "lucide-react";
import { subscribeScreenshot } from "@/lib/screenshotCache";

// How long the user must keep hovering before we commit to loading the live site
const HOVER_AFFORD_MS = 700;

interface ProjectIframeProps {
    src: string;
    title: string;
    mobileDimensions?: boolean;
    slideFrom?: "left" | "right";
    /** Override the screenshot URL (defaults to thum.io for external src) */
    screenshotSrc?: string;
}

export default function ProjectIframe({
    src,
    title,
    mobileDimensions = true,
    slideFrom = "left",
    screenshotSrc,
}: ProjectIframeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverTimerFired, setHoverTimerFired] = useState(false);
    const [showingIframe, setShowingIframe] = useState(false);

    // Screenshot cache state — null until the cache resolves
    const [screenshotDisplaySrc, setScreenshotDisplaySrc] = useState<
        string | null
    >(null);
    const [screenshotLoading, setScreenshotLoading] = useState(true);
    // Tracks whether the <img> element has actually painted — avoids blank flash
    const [screenshotImgLoaded, setScreenshotImgLoaded] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

    const heightClass = mobileDimensions
        ? "h-[400px] md:h-[600px] w-[300px] md:w-[400px]"
        : "h-[600px]";

    // Derive screenshot URL — thum.io for external URLs, nothing for internal routes
    const effectiveScreenshotUrl =
        screenshotSrc ??
        (src.startsWith("http")
            ? `https://image.thum.io/get/width/1280/${src}`
            : null);

    // Subscribe to cached screenshot
    useEffect(() => {
        if (!effectiveScreenshotUrl) {
            setScreenshotLoading(false);
            return;
        }

        const unsub = subscribeScreenshot(effectiveScreenshotUrl, (result) => {
            setScreenshotDisplaySrc(result.src);
            setScreenshotLoading(result.loading);
        });

        return unsub;
    }, [effectiveScreenshotUrl]);

    // Slide-in animation via IntersectionObserver
    useEffect(() => {
        const timeout = setTimeout(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                },
                { threshold: 0.1, rootMargin: "-200px 0px" }
            );
            if (containerRef.current) observer.observe(containerRef.current);
            return () => observer.disconnect();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    // Reveal iframe once timer elapsed + iframe loaded + still hovering
    useEffect(() => {
        if (hoverTimerFired && iframeLoaded && isHovering && !showingIframe) {
            setShowingIframe(true);
        }
    }, [hoverTimerFired, iframeLoaded, isHovering, showingIframe]);

    // Cleanup hover timer on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        if (showingIframe) return;
        setIsHovering(true);
        setShouldLoadIframe(true); // start loading in background immediately
        hoverTimerRef.current = setTimeout(() => {
            setHoverTimerFired(true);
        }, HOVER_AFFORD_MS);
    };

    const handleMouseLeave = () => {
        if (showingIframe) return;
        setIsHovering(false);
        setHoverTimerFired(false);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    // Click/tap bypasses the affordance timer — useful on touch devices
    const handleClick = () => {
        if (showingIframe) return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setShouldLoadIframe(true);
        setIsHovering(true);
        setHoverTimerFired(true);
    };

    const handleIframeLoad = () => {
        setIframeLoaded(true);
    };

    const slideClass =
        slideFrom === "left"
            ? "translate-x-[-100px] opacity-0"
            : "translate-x-[100px] opacity-0";

    const showLoadingOverlay = isHovering && hoverTimerFired && !showingIframe;

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${heightClass} rounded-lg shadow-xl overflow-hidden transition-all duration-700 ease-out ${
                isVisible ? "translate-x-0 opacity-100" : slideClass
            } ${!showingIframe ? "cursor-pointer" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Screenshot / CTA placeholder — shown until iframe is revealed */}
            {!showingIframe && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* CTA — visible until the screenshot image has fully loaded */}
                    {!screenshotImgLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-green-50 via-teal-50/80 to-cyan-50 dark:bg-zinc-900 dark:border dark:border-teal-800/40">
                            {/* Icon with subtle glow ring */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-teal-400/20 dark:bg-teal-500/15 scale-150 blur-md" />
                                <div className="relative rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 p-4 border border-teal-200/60 dark:border-teal-700/40 shadow-sm">
                                    {screenshotLoading ? (
                                        <Loader2
                                            className="animate-spin text-teal-500 dark:text-teal-400"
                                            size={26}
                                        />
                                    ) : (
                                        <MousePointerClick
                                            className="text-teal-600 dark:text-teal-400"
                                            size={26}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Text */}
                            <div className="text-center space-y-1.5 px-8">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600/70 dark:text-teal-500/60">
                                    {screenshotLoading
                                        ? "Loading preview…"
                                        : "Live preview"}
                                </p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                                    Hover or click for a live view of
                                </p>
                                <p className="text-base font-semibold font-bbh-bartle text-zinc-800 dark:text-zinc-200">
                                    {title}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Screenshot image — rendered when src is known, fades in on load */}
                    {screenshotDisplaySrc && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={screenshotDisplaySrc}
                            alt={`${title} preview`}
                            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
                                screenshotImgLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            onLoad={() => setScreenshotImgLoaded(true)}
                        />
                    )}

                    {/* Hover affordance overlay */}
                    {showLoadingOverlay && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-white">
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-sm font-medium">
                                    Loading website...
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Iframe — loaded eagerly in background on hover, revealed after affordance */}
            {shouldLoadIframe && (
                <iframe
                    src={src}
                    className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
                        showingIframe
                            ? "z-20 opacity-100"
                            : "z-0 opacity-0 pointer-events-none"
                    }`}
                    title={title}
                    loading="eager"
                    tabIndex={showingIframe ? 0 : -1}
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                    onLoad={handleIframeLoad}
                />
            )}
        </div>
    );
}
