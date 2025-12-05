"use client";

import React from "react";
import { MenuBar } from "./MenuBar";
import { Desktop } from "./Desktop";
import { Dock } from "./Dock";
import { AppWindow } from "./AppWindow";
import { useAppStore } from "@/app/store/appStore";
import { getAllContent, getFeaturedContent } from "@/app/data/content";
import type { Content } from "@/app/data/content";

export function DesktopOS() {
    const { windows, openWindow, closeWindow, minimizeWindow, focusWindow } =
        useAppStore();
    const allContent = getAllContent();
    const featuredContent = getFeaturedContent();

    const handleContextMenu = (e: React.MouseEvent, content: Content) => {
        e.preventDefault();
        // Context menu implementation can be added later
    };

    return (
        <div
            className="h-screen w-screen bg-[rgb(var(--bg-desktop))] overflow-hidden relative"
            style={{ width: "100vw", height: "100vh", maxWidth: "100vw" }}
        >
            <MenuBar />

            {/* Desktop Area */}
            <div
                className="pt-12 h-[calc(100vh-48px)] relative overflow-hidden z-10"
                style={{
                    width: "100vw",
                    maxWidth: "100vw",
                    position: "relative",
                }}
            >
                <Desktop
                    content={allContent}
                    onOpenContent={openWindow}
                    onContextMenu={handleContextMenu}
                />

                {/* Windows */}
                {windows
                    .filter((w) => !w.minimized)
                    .map((window) => (
                        <AppWindow
                            key={window.id}
                            window={window}
                            onClose={() => closeWindow(window.id)}
                            onMinimize={() => minimizeWindow(window.id)}
                            onFocus={() => focusWindow(window.id)}
                        />
                    ))}
            </div>

            {/* Dock */}
            <Dock
                items={windows.map((w) => w.content)}
                windows={windows}
                onOpenItem={openWindow}
            />
        </div>
    );
}
