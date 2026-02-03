"use client";

import { useState, useEffect, useRef } from "react";

interface ProjectIframeProps {
    src: string;
    title: string;
    mobileDimensions?: boolean;
    slideFrom?: "left" | "right";
}

export default function ProjectIframe({
    src,
    title,
    mobileDimensions = true,
    slideFrom = "left",
}: ProjectIframeProps) {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<Element | null>(null);

    const heightClass = mobileDimensions
        ? "h-[400px] md:h-[600px] w-[300px] md:w-[400px]"
        : "h-[600px]";

    // Find the scroll container (the fixed portfolio layout)
    useEffect(() => {
        scrollContainerRef.current = containerRef.current?.closest('.fixed.overflow-auto') || document.documentElement;
    }, []);

    // Start observing after a delay to let page settle
    useEffect(() => {
        const timeout = setTimeout(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: "-200px 0px"
                }
            );

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => observer.disconnect();
        }, 500);

        return () => clearTimeout(timeout);
    }, []);

    // Once iframe loads, trigger the slide-in animation (delayed to follow text)
    useEffect(() => {
        if (isLoaded) {
            const timeout = setTimeout(() => setIsVisible(true), 300);
            return () => clearTimeout(timeout);
        }
    }, [isLoaded]);

    const handleIframeLoad = () => {
        // Save scroll position, set loaded, then restore in next frame
        const container = scrollContainerRef.current;
        const scrollTop = container?.scrollTop ?? 0;

        setIsLoaded(true);

        // Restore scroll position after any iframe-induced scroll
        requestAnimationFrame(() => {
            if (container) {
                container.scrollTop = scrollTop;
            }
            // Double-check after a short delay
            setTimeout(() => {
                if (container) {
                    container.scrollTop = scrollTop;
                }
            }, 50);
        });
    };

    const slideClass = slideFrom === "left"
        ? "translate-x-[-100px] opacity-0"
        : "translate-x-[100px] opacity-0";

    return (
        <div
            ref={containerRef}
            className={`w-full ${heightClass} rounded-lg shadow-xl overflow-hidden transition-all duration-700 ease-out ${
                isVisible ? "translate-x-0 opacity-100" : slideClass
            }`}
        >
            {shouldLoad ? (
                <iframe
                    src={src}
                    className="w-full h-full border-0"
                    title={title}
                    loading="eager"
                    tabIndex={-1}
                    sandbox="allow-scripts allow-same-origin"
                    onLoad={handleIframeLoad}
                />
            ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800" />
            )}
        </div>
    );
}
