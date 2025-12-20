"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    PanInfo,
} from "framer-motion";
import { StatusBar } from "./StatusBar";
import { AppGrid } from "./AppGrid";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { getAllContent } from "@/app/data/content";
import type { Content } from "@/app/data/content";
import { X } from "lucide-react";
import { AppTray } from "@/components/shared/AppTray";
import { RevolvingText } from "@/components/shared/RevolvingText";

export function MobileOS() {
    const allContent = getAllContent();
    const [selectedContent, setSelectedContent] = useState<Content | null>(
        null
    );
    const [currentSection, setCurrentSection] = useState<
        "left" | "apps" | "right"
    >("apps");
    const [currentAppPage, setCurrentAppPage] = useState(0); // For app grid pagination
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState(375);
    const [pageHeight, setPageHeight] = useState(667);
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showIndicators, setShowIndicators] = useState(false);
    const hideIndicatorsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const modalHeaderRef = useRef<HTMLDivElement>(null);
    const [titleContainerWidth, setTitleContainerWidth] = useState(0);

    // Calculate how many apps fit per page
    // Grid is 3 columns, with padding and gaps
    // Each app icon is roughly: icon (64px) + gap (16px) + text (20px) + padding
    const appsPerPage = useMemo(() => {
        const padding = 16; // p-4 = 16px top/bottom
        const statusBarHeight = 44; // Approximate status bar height
        const pageIndicatorHeight = 48; // Approximate page indicator height
        // AppTray: minHeight 80px + padding p-2 (8px top/bottom = 16px) + margin m-2 (8px top/bottom = 16px) = ~112px
        const appTrayHeight = 112;
        const availableHeight =
            pageHeight -
            statusBarHeight -
            pageIndicatorHeight -
            appTrayHeight -
            padding * 2;

        // Each row: icon (64px) + gap (16px) + text (~20px) = ~100px per row
        const rowHeight = 100;
        const rowsPerPage = Math.floor(availableHeight / rowHeight);
        const appsPerPage = rowsPerPage * 3; // 3 columns

        return Math.max(6, appsPerPage); // Minimum 6 apps per page (2 rows)
    }, [pageHeight]);

    // Split content into pages
    const appPages = useMemo(() => {
        const pages: Content[][] = [];
        for (let i = 0; i < allContent.length; i += appsPerPage) {
            pages.push(allContent.slice(i, i + appsPerPage));
        }
        return pages;
    }, [allContent, appsPerPage]);

    // Calculate total pages: left (1) + app pages + right (1)
    const totalPages = 1 + appPages.length + 1;
    const leftPageIndex = 0;
    const rightPageIndex = totalPages - 1;
    const firstAppPageIndex = 1;
    const lastAppPageIndex = totalPages - 2;

    // Get current absolute page index
    const currentPageIndex = useMemo(() => {
        if (currentSection === "left") return leftPageIndex;
        if (currentSection === "right") return rightPageIndex;
        return firstAppPageIndex + currentAppPage;
    }, [
        currentSection,
        currentAppPage,
        leftPageIndex,
        rightPageIndex,
        firstAppPageIndex,
    ]);

    // Get page width and height on mount and resize - use fixed values
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setPageWidth(rect.width);
                setPageHeight(rect.height);
            } else {
                // Fallback to window dimensions
                setPageWidth(window.innerWidth);
                setPageHeight(window.innerHeight);
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Update x position when page changes
    useEffect(() => {
        x.set(-pageWidth * currentPageIndex);
    }, [currentPageIndex, pageWidth, x]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideIndicatorsTimeoutRef.current) {
                clearTimeout(hideIndicatorsTimeoutRef.current);
            }
        };
    }, []);

    // Calculate available width for title in modal header
    useEffect(() => {
        const updateTitleWidth = () => {
            if (modalHeaderRef.current && selectedContent) {
                const headerWidth = modalHeaderRef.current.offsetWidth;
                const padding = 32; // p-4 = 16px on each side = 32px total
                const buttonWidth = 32; // w-8 = 32px
                const gap = 16; // gap between title and button (flex gap)
                const availableWidth =
                    headerWidth - padding - buttonWidth - gap;
                setTitleContainerWidth(Math.max(0, availableWidth));
            }
        };
        updateTitleWidth();
        window.addEventListener("resize", updateTitleWidth);
        return () => window.removeEventListener("resize", updateTitleWidth);
    }, [selectedContent]);

    const handleOpenItem = (content: Content) => {
        setSelectedContent(content);
    };

    const handleCloseModal = () => {
        setSelectedContent(null);
    };

    const handleNiIconClick = () => {
        setCurrentSection("right");
    };

    const handleDragStart = () => {
        setIsDragging(true);
        setShowIndicators(true);
        // Clear any existing timeout
        if (hideIndicatorsTimeoutRef.current) {
            clearTimeout(hideIndicatorsTimeoutRef.current);
        }
    };

    const handleDragEnd = (
        _event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        setIsDragging(false);
        const threshold = pageWidth * 0.1; // 10% threshold - more sensitive
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const isMouse = _event.type.startsWith("mouse");

        // For mouse drags, be more lenient with velocity (mouse drags are slower)
        const velocityThreshold = isMouse ? 100 : 150;

        let newPageIndex = currentPageIndex;

        // Velocity-based detection - prioritize velocity for quick swipes
        if (Math.abs(velocity) > velocityThreshold) {
            // Fast swipe - change page based on velocity direction
            if (velocity < 0 && currentPageIndex < rightPageIndex) {
                newPageIndex = currentPageIndex + 1;
            } else if (velocity > 0 && currentPageIndex > leftPageIndex) {
                newPageIndex = currentPageIndex - 1;
            }
        } else if (Math.abs(offset) > threshold) {
            // Distance-based detection - more sensitive
            if (offset < 0 && currentPageIndex < rightPageIndex) {
                newPageIndex = currentPageIndex + 1;
            } else if (offset > 0 && currentPageIndex > leftPageIndex) {
                newPageIndex = currentPageIndex - 1;
            }
        }

        // Update state based on new page index
        if (newPageIndex !== currentPageIndex) {
            if (newPageIndex === leftPageIndex) {
                setCurrentSection("left");
            } else if (newPageIndex === rightPageIndex) {
                setCurrentSection("right");
            } else {
                setCurrentSection("apps");
                setCurrentAppPage(newPageIndex - firstAppPageIndex);
            }
        }

        // Hide indicators after 0.25 seconds
        hideIndicatorsTimeoutRef.current = setTimeout(() => {
            setShowIndicators(false);
        }, 250);
    };

    return (
        <div
            ref={containerRef}
            className="h-screen w-screen bg-[rgb(var(--bg-desktop))] text-[rgb(var(--text-primary))] overflow-hidden flex flex-col fixed inset-0"
            style={{
                width: "100vw",
                height: "100vh",
                overflowX: "hidden",
                touchAction: "pan-x",
            }}
        >
            {/* Swipeable Container */}
            <div
                className="flex-1 overflow-hidden relative"
                style={{
                    width: "100%",
                    height: "100%",
                    overflowX: "hidden",
                    touchAction: "pan-x",
                }}
            >
                {/* Page Indicators - Positioned at bottom of app grid area, just above app tray */}
                {!selectedContent && currentSection === "apps" && (
                    <AnimatePresence>
                        {showIndicators && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    bottom: "140px", // App tray height (80px minHeight + 16px padding + 16px margin)
                                }}
                            >
                                {Array.from({ length: totalPages }).map(
                                    (_, index) => {
                                        const isActive =
                                            index === currentPageIndex;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (
                                                        index === leftPageIndex
                                                    ) {
                                                        setCurrentSection(
                                                            "left"
                                                        );
                                                    } else if (
                                                        index === rightPageIndex
                                                    ) {
                                                        setCurrentSection(
                                                            "right"
                                                        );
                                                    } else {
                                                        setCurrentSection(
                                                            "apps"
                                                        );
                                                        setCurrentAppPage(
                                                            index -
                                                                firstAppPageIndex
                                                        );
                                                    }
                                                }}
                                                className={`h-2 rounded-full transition-all pointer-events-auto ${
                                                    isActive
                                                        ? "bg-[rgb(var(--accent-nickel))] w-6"
                                                        : "bg-[rgb(var(--text-secondary))] opacity-50 w-2"
                                                }`}
                                                aria-label={`Go to page ${
                                                    index + 1
                                                }`}
                                            />
                                        );
                                    }
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
                <motion.div
                    className="flex h-full"
                    style={{
                        x,
                        width: `${totalPages * pageWidth}px`,
                        height: "100%",
                    }}
                    drag="x"
                    dragConstraints={{
                        left: -pageWidth * (totalPages - 1),
                        right: 0,
                    }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    animate={{ x: -pageWidth * currentPageIndex }}
                    transition={{ type: "spring", stiffness: 500, damping: 50 }}
                >
                    {/* Left Panel (Settings/Contact/About) */}
                    <div
                        className="h-full flex-shrink-0 overflow-hidden"
                        style={{
                            width: `${pageWidth}px`,
                            height: "100%",
                            overflowX: "hidden",
                            touchAction: "pan-y",
                        }}
                    >
                        <LeftPanel onNiIconClick={handleNiIconClick} />
                    </div>

                    {/* App Grid Pages */}
                    {appPages.map((pageContent, pageIndex) => (
                        <div
                            key={`app-page-${pageIndex}`}
                            className="h-full flex-shrink-0 overflow-hidden"
                            style={{
                                width: `${pageWidth}px`,
                                height: "100%",
                                overflowX: "hidden",
                                touchAction: "pan-y",
                            }}
                        >
                            <div className="h-full">
                                <AppGrid
                                    content={pageContent}
                                    onOpenItem={handleOpenItem}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Right Panel (Search/Categories) */}
                    <div
                        className="h-full flex-shrink-0 overflow-hidden"
                        style={{
                            width: `${pageWidth}px`,
                            height: "100%",
                            overflowX: "hidden",
                            touchAction: "pan-y",
                        }}
                    >
                        <RightPanel onOpenItem={handleOpenItem} />
                    </div>
                </motion.div>
            </div>

            {/* App Tray - Only show on home screen (when no app is selected) and when we are not on the first or last page (left and right screen) */}
            {!selectedContent &&
                currentPageIndex !== leftPageIndex &&
                currentPageIndex !== rightPageIndex && (
                    <AppTray onOpenItem={handleOpenItem} />
                )}

            {/* Full Screen Modal for Content */}
            <AnimatePresence>
                {selectedContent && (
                    <motion.div
                        className="fixed inset-0 bg-[rgb(var(--bg-desktop))] z-50 flex flex-col"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            ref={modalHeaderRef}
                            className="p-4 border-b border-[rgb(var(--border-window))] flex items-center justify-between gap-4 flex-shrink-0"
                        >
                            <div className="flex-1 min-w-0">
                                {titleContainerWidth > 0 && (
                                    <RevolvingText
                                        text={selectedContent.title}
                                        containerWidth={titleContainerWidth}
                                        className="text-lg font-bbh-bartle font-semibold text-[rgb(var(--text-primary))]"
                                    />
                                )}
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 flex-shrink-0 rounded-full hover:bg-[rgb(var(--bg-button-hover))] flex items-center justify-center text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <ContentRenderer content={selectedContent} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
