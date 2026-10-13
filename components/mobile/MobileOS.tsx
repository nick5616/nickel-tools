"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    MotionConfig,
    useMotionValue,
    animate,
    type PanInfo,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { StatusBar } from "./StatusBar";
import { AppGrid } from "./AppGrid";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { MobileDock } from "./MobileDock";
import { AppSheet, type SheetExit } from "./AppSheet";
import { AppSwitcher } from "./AppSwitcher";
import { LongPressMenu } from "./LongPressMenu";
import { getAllContent, getContentById } from "@/app/data/content";
import type { Content } from "@/app/data/content";
import { Wallpaper } from "@/components/shared/Wallpaper";
import { Spotlight } from "@/components/shared/Spotlight";
import { springs, type OriginRect } from "@/components/shared/motion";
import { useSystemStore } from "@/app/store/systemStore";
import { useSpecularLight } from "@/app/hooks/useSpecularLight";

// Home-screen grid metrics (4 columns)
const ROW_HEIGHT = 96; // 60px tile + label + row gap
const STATUS_BAR = 54;
const DOCK = 118;
const DOTS = 28;

interface Opened {
    content: Content;
    rect?: OriginRect;
}

export function MobileOS() {
    const allContent = getAllContent();
    const pathname = usePathname();
    const { hydrate, setSpotlightOpen } = useSystemStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState(375);
    const [pageHeight, setPageHeight] = useState(667);
    const [pageIndex, setPageIndex] = useState(1); // 0 = Today, last = Library
    const x = useMotionValue(0);

    const [opened, setOpened] = useState<Opened | null>(null);
    const [sheetExit, setSheetExit] = useState<SheetExit>("home");
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [recents, setRecents] = useState<Content[]>([]);
    const [longPress, setLongPress] = useState<Opened | null>(null);
    const [activity, setActivity] = useState<string | null>(null);
    const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => hydrate(), [hydrate]);
    useSpecularLight();

    const appsPerPage = useMemo(() => {
        const available = pageHeight - STATUS_BAR - DOCK - DOTS - 12;
        return Math.max(2, Math.floor(available / ROW_HEIGHT)) * 4;
    }, [pageHeight]);

    const appPages = useMemo(() => {
        const pages: Content[][] = [];
        for (let i = 0; i < allContent.length; i += appsPerPage) {
            pages.push(allContent.slice(i, i + appsPerPage));
        }
        return pages;
    }, [allContent, appsPerPage]);

    const totalPages = appPages.length + 2;
    const lastPage = totalPages - 1;
    const onAppPage = pageIndex > 0 && pageIndex < lastPage;

    // Measure the viewport (dvh-aware)
    useEffect(() => {
        const update = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            setPageWidth(rect?.width || window.innerWidth);
            setPageHeight(rect?.height || window.innerHeight);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Keep the strip on the current page
    useEffect(() => {
        animate(x, -pageWidth * pageIndex, springs.window);
    }, [pageIndex, pageWidth, x]);

    // Clamp if the page count shrinks (e.g. rotation)
    useEffect(() => {
        if (pageIndex > lastPage) setPageIndex(lastPage);
    }, [pageIndex, lastPage]);

    const flashActivity = useCallback((text: string) => {
        setActivity(text);
        if (activityTimer.current) clearTimeout(activityTimer.current);
        activityTimer.current = setTimeout(() => setActivity(null), 2400);
    }, []);

    const openItem = useCallback(
        (content: Content, rect?: OriginRect) => {
            setLongPress(null);
            setSwitcherOpen(false);
            setSheetExit("home");
            setOpened({ content, rect });
            setRecents((prev) => [content, ...prev.filter((c) => c.id !== content.id)].slice(0, 8));
            flashActivity(content.title);
        },
        [flashActivity]
    );

    // Open app from URL on mount (e.g. /desktop/{app-id})
    useEffect(() => {
        let appId: string | null = null;
        if (pathname.startsWith("/desktop/")) {
            appId = pathname.slice("/desktop/".length);
        } else if (pathname !== "/" && pathname !== "/desktop") {
            appId = pathname.slice(1);
        }
        if (appId) {
            const content = getContentById(appId);
            if (content) openItem(content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closeSheet = () => {
        setSheetExit("home");
        setOpened(null);
    };

    const toSwitcher = () => {
        setSheetExit("switcher");
        setOpened(null);
        setSwitcherOpen(true);
    };

    const handleDragEnd = (_e: unknown, info: PanInfo) => {
        // Pull down on the home screen for search
        if (onAppPage && info.offset.y > 70 && Math.abs(info.offset.x) < 50) {
            setSpotlightOpen(true);
            animate(x, -pageWidth * pageIndex, springs.window);
            return;
        }
        const swipe = Math.abs(info.velocity.x) > 200 || Math.abs(info.offset.x) > pageWidth * 0.18;
        let next = pageIndex;
        if (swipe) {
            const dir = (Math.abs(info.velocity.x) > 200 ? info.velocity.x : info.offset.x) < 0 ? 1 : -1;
            next = Math.max(0, Math.min(lastPage, pageIndex + dir));
        }
        if (next === pageIndex) animate(x, -pageWidth * pageIndex, springs.window);
        else setPageIndex(next);
    };

    const pageStyle: React.CSSProperties = { width: pageWidth, height: "100%" };

    return (
        <MotionConfig reducedMotion="user">
            <div
                ref={containerRef}
                className="fixed inset-0 overflow-hidden text-[rgb(var(--text-primary))]"
                style={{ height: "100dvh" }}
            >
                <Wallpaper />

                {/* Today and the Library blur the wallpaper, like iOS */}
                <motion.div
                    className="absolute inset-0 backdrop-blur-2xl bg-[rgb(var(--bg-desktop)/0.25)] pointer-events-none"
                    animate={{ opacity: onAppPage ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                />

                <div className="relative z-10 h-full flex flex-col">
                    <StatusBar activity={activity} />

                    <div className="relative flex-1 min-h-0 overflow-hidden">
                        <motion.div
                            className="flex h-full"
                            style={{ x, width: totalPages * pageWidth }}
                            drag="x"
                            dragConstraints={{ left: -pageWidth * lastPage, right: 0 }}
                            dragElastic={0.12}
                            dragMomentum={false}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="shrink-0" style={pageStyle}>
                                <LeftPanel onOpenItem={(c) => openItem(c)} />
                            </div>

                            {appPages.map((pageContent, i) => (
                                <div
                                    key={`app-page-${i}`}
                                    className="shrink-0"
                                    // No browser gestures here, so pull-down and swipes reach us
                                    style={{ ...pageStyle, touchAction: "none" }}
                                >
                                    <AppGrid
                                        content={pageContent}
                                        onOpenItem={openItem}
                                        onLongPress={(content, rect) => setLongPress({ content, rect })}
                                    />
                                </div>
                            ))}

                            <div className="shrink-0" style={pageStyle}>
                                <RightPanel
                                    onOpenItem={openItem}
                                    onSearch={() => setSpotlightOpen(true)}
                                />
                            </div>
                        </motion.div>

                        {/* Page dots */}
                        <div
                            className="absolute inset-x-0 flex justify-center pointer-events-none z-10"
                            style={{ bottom: onAppPage ? DOCK + 6 : 14 }}
                        >
                            <div className="nk-material-thin flex items-center gap-2 px-2.5 h-6 rounded-full pointer-events-auto">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const active = i === pageIndex;
                                    const edge = i === 0 || i === lastPage;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setPageIndex(i)}
                                            className={`rounded-full transition-all ${
                                                active
                                                    ? "w-2 h-2 bg-[rgb(var(--text-primary))]"
                                                    : "w-1.5 h-1.5 bg-[rgb(var(--text-primary)/0.35)]"
                                            } ${edge ? "!rounded-[2px]" : ""}`}
                                            aria-label={
                                                i === 0 ? "Today" : i === lastPage ? "App Library" : `Home page ${i}`
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence>
                            {onAppPage && (
                                <MobileDock
                                    key="dock"
                                    onOpenItem={openItem}
                                    onLongPress={(content, rect) => setLongPress({ content, rect })}
                                    onSearch={() => setSpotlightOpen(true)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence custom={sheetExit}>
                    {opened && (
                        <AppSheet
                            key={opened.content.id}
                            content={opened.content}
                            originRect={opened.rect}
                            onClose={closeSheet}
                            onSwitcher={toSwitcher}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {switcherOpen && (
                        <AppSwitcher
                            recents={recents}
                            onOpen={(content) => openItem(content)}
                            onRemove={(id) => setRecents((prev) => prev.filter((c) => c.id !== id))}
                            onClose={() => setSwitcherOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {longPress && (
                        <LongPressMenu
                            key={longPress.content.id}
                            content={longPress.content}
                            rect={longPress.rect}
                            onOpen={(content) => openItem(content, longPress.rect)}
                            onClose={() => setLongPress(null)}
                        />
                    )}
                </AnimatePresence>

                <Spotlight mobile onOpenContent={(content) => openItem(content)} />
            </div>
        </MotionConfig>
    );
}
