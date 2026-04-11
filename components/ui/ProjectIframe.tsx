"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import ElectricPlaceholder from "@/components/ui/ElectricPlaceholder";

// How long the user must keep hovering before we commit to loading the live site
const HOVER_AFFORD_MS = 700;

interface ProjectIframeProps {
    src: string;
    title: string;
    mobileDimensions?: boolean;
    slideFrom?: "left" | "right";
    refreshTrigger?: number;
}

export default function ProjectIframe({
    src,
    title,
    mobileDimensions = true,
    slideFrom = "left",
    refreshTrigger = 0,
}: ProjectIframeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverTimerFired, setHoverTimerFired] = useState(false);
    const [showingIframe, setShowingIframe] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const prevRefreshTrigger = useRef(refreshTrigger);

    const heightClass = mobileDimensions
        ? "h-[400px] md:h-[600px] w-[300px] md:w-[400px]"
        : "h-[600px]";

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

    // Reload iframe when refreshTrigger increments
    useEffect(() => {
        if (refreshTrigger === prevRefreshTrigger.current) return;
        prevRefreshTrigger.current = refreshTrigger;
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    }, [refreshTrigger]);

    // Cleanup hover timer on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        if (showingIframe) return;
        setIsHovering(true);
        setShouldLoadIframe(true);
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
            {/* Electric placeholder — shown until iframe is revealed */}
            {!showingIframe && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <ElectricPlaceholder hovered={isHovering} />

                    {showLoadingOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-4 py-2 text-green-300">
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-sm font-medium">
                                    Loading…
                                </span>
                            </div>
                        </div>
                    )}

                    {!showLoadingOverlay && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <span className="text-xs text-green-400/50 tracking-widest uppercase">
                                hover · click
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Iframe — loaded in background on hover, revealed after affordance */}
            {shouldLoadIframe && (
                <iframe
                    ref={iframeRef}
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
                    onLoad={() => setIframeLoaded(true)}
                />
            )}
        </div>
    );
}
