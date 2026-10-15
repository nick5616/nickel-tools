"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { MenuBar } from "./MenuBar";
import { Desktop } from "./Desktop";
import { Dock } from "./Dock";
import { AppWindow } from "./AppWindow";
import { MenuDropdown, type MenuItem } from "./MenuDropdown";
import {
    useAppStore,
    getFocusedWindow,
    MENU_BAR_HEIGHT,
} from "@/app/store/appStore";
import { useSystemStore } from "@/app/store/systemStore";
import { getAllContent, getContentById } from "@/app/data/content";
import type { Content } from "@/app/data/content";
import { useUrlSync } from "@/app/hooks/useUrlSync";
import { useSpecularLight } from "@/app/hooks/useSpecularLight";
import { Wallpaper } from "@/components/shared/Wallpaper";
import { Spotlight } from "@/components/shared/Spotlight";

interface ContextMenuState {
    x: number;
    y: number;
    content?: Content;
}

export function DesktopOS() {
    const { windows, openWindow, closeWindow, minimizeWindow, focusWindow, menu, setSortMethod } =
        useAppStore();
    const { hydrate, useStacks, setUseStacks, setControlCenterOpen } =
        useSystemStore();
    const allContent = getAllContent();
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    useEffect(() => hydrate(), [hydrate]);
    useSpecularLight();
    // Sync window state with URL query params
    useUrlSync();

    const focused = getFocusedWindow(windows);

    const handleContextMenu = (e: React.MouseEvent, content?: Content) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, content });
    };

    const openInNewTab = (content: Content) => {
        if (content.type === "external") {
            window.open(content.url, "_blank", "noopener,noreferrer");
        } else if (content.type === "internal") {
            window.open(content.route, "_blank");
        }
    };

    const contextItems: MenuItem[] = contextMenu?.content
        ? [
              { label: "Open", onClick: () => openWindow(contextMenu.content!) },
              { label: "Open in New Tab", onClick: () => openInNewTab(contextMenu.content!) },
              { separator: true },
              {
                  label: "Copy Link",
                  onClick: () =>
                      navigator.clipboard?.writeText(
                          `${window.location.origin}/desktop/${contextMenu.content!.id}`
                      ),
              },
          ]
        : [
              { label: "Change Wallpaper & Palette…", onClick: () => setControlCenterOpen(true) },
              {
                  label: "Open Color Engine",
                  onClick: () => {
                      const settings = getContentById("settings");
                      if (settings) openWindow(settings);
                  },
              },
              { separator: true },
              { label: "Use Stacks", onClick: () => setUseStacks(!useStacks), checked: useStacks },
              { separator: true },
              { label: "Sort by Name", onClick: () => setSortMethod("name"), radio: true, checked: menu.sortMethod === "name" },
              { label: "Sort by Date", onClick: () => setSortMethod("date"), radio: true, checked: menu.sortMethod === "date" },
              { label: "Sort by Category", onClick: () => setSortMethod("category"), radio: true, checked: menu.sortMethod === "category" },
          ];

    return (
        <MotionConfig reducedMotion="user">
            <div
                className="h-screen w-screen overflow-hidden relative"
                style={{ height: "100dvh" }}
            >
                <Wallpaper />
                <MenuBar />

                {/* Desktop Area — window positions are relative to this */}
                <div
                    id="nk-desktop-area"
                    className="absolute bottom-0 left-0 right-0 overflow-hidden z-10"
                    style={{ top: MENU_BAR_HEIGHT }}
                >
                    <Desktop
                        content={allContent}
                        onOpenContent={openWindow}
                        onContextMenu={handleContextMenu}
                    />

                    <AnimatePresence>
                        {windows.map((window) => (
                            <AppWindow
                                key={window.id}
                                window={window}
                                isActive={focused?.id === window.id}
                                onClose={() => closeWindow(window.id)}
                                onMinimize={() => minimizeWindow(window.id)}
                                onFocus={() => {
                                    if (focused?.id !== window.id) focusWindow(window.id);
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <Dock />
                <Spotlight onOpenContent={(content) => openWindow(content)} />

                <MenuDropdown
                    isOpen={!!contextMenu}
                    onClose={() => setContextMenu(null)}
                    items={contextItems}
                    position={{
                        top: contextMenu?.y ?? 0,
                        left: Math.min(contextMenu?.x ?? 0, (typeof window !== "undefined" ? window.innerWidth : 1200) - 220),
                    }}
                />
            </div>
        </MotionConfig>
    );
}
