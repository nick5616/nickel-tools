"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/app/store/appStore";
import { getContentById } from "@/app/data/content";

/**
 * Hook to sync window state with URL.
 * Uses route format: /desktop/app-id?maximized=true
 * Tracks the last opened/focused app in the URL.
 */
export function useUrlSync() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { windows, openWindow, toggleMaximizeWindow } = useAppStore();
    const isInitialized = useRef(false);
    // Start with true to prevent URL updates during initial mount
    const isUpdatingUrl = useRef(true);

    // Initialize app from URL on mount
    useEffect(() => {
        if (isInitialized.current) return;

        // Extract app ID from pathname
        // Handle both /desktop/app-name and /app-name formats for backwards compatibility
        let appId: string | null = null;
        if (pathname === "/" || pathname === "/desktop") {
            appId = null;
        } else if (pathname.startsWith("/desktop/")) {
            // Extract app ID from /desktop/app-name format
            appId = pathname.slice("/desktop/".length);
        } else {
            // Legacy format: /app-name (for backwards compatibility)
            appId = pathname.slice(1);
        }
        const maximized = searchParams.get("maximized") === "true";

        // If no app ID in URL (home page or desktop page), don't do anything (let user start fresh)
        if (!appId) {
            isInitialized.current = true;
            isUpdatingUrl.current = false;
            return;
        }

        // Set flag to prevent URL updates during initialization
        isUpdatingUrl.current = true;

        const content = getContentById(appId);
        if (content) {
            // Check if window already exists
            const existingWindow = useAppStore
                .getState()
                .windows.find((w) => w.content.id === appId);

            if (existingWindow) {
                // Focus the existing window
                useAppStore.getState().focusWindow(existingWindow.id);

                // Set maximized state if needed
                if (maximized && !existingWindow.maximized) {
                    toggleMaximizeWindow(existingWindow.id);
                } else if (!maximized && existingWindow.maximized) {
                    toggleMaximizeWindow(existingWindow.id);
                }

                // Mark as initialized
                isInitialized.current = true;
                setTimeout(() => {
                    isUpdatingUrl.current = false;
                }, 100);
            } else {
                // Open new window
                openWindow(content);

                // Set maximized state after window is created
                // Use a retry mechanism to ensure window is fully created
                let retries = 0;
                const maxRetries = 5;
                const checkAndSetMaximized = () => {
                    const window = useAppStore
                        .getState()
                        .windows.find((w) => w.content.id === appId);
                    if (window) {
                        // Focus it
                        useAppStore.getState().focusWindow(window.id);

                        // Set maximized if needed
                        if (maximized && !window.maximized) {
                            toggleMaximizeWindow(window.id);
                        }
                        isInitialized.current = true;
                        setTimeout(() => {
                            isUpdatingUrl.current = false;
                        }, 100);
                    } else if (retries < maxRetries) {
                        retries++;
                        setTimeout(checkAndSetMaximized, 100);
                    } else {
                        // Window not found after retries, mark as initialized anyway
                        isInitialized.current = true;
                        setTimeout(() => {
                            isUpdatingUrl.current = false;
                        }, 100);
                    }
                };
                setTimeout(checkAndSetMaximized, 200);
                return;
            }
        } else {
            // App not found, just show desktop OS
            isInitialized.current = true;
            setTimeout(() => {
                isUpdatingUrl.current = false;
            }, 100);
        }
    }, [pathname, searchParams, openWindow, toggleMaximizeWindow]);

    // Update URL when windows change (track the focused/opened app)
    // Use window.history.replaceState to avoid triggering Next.js navigation and re-renders
    useEffect(() => {
        if (!isInitialized.current || isUpdatingUrl.current) return;
        if (typeof window === "undefined") return;

        // Get the topmost (highest z-index) non-minimized window
        const visibleWindows = windows.filter((w) => !w.minimized);

        let topWindow;
        if (visibleWindows.length > 0) {
            // Find the window with the highest z-index among visible windows
            topWindow = visibleWindows.reduce((prev, current) =>
                current.zIndex > prev.zIndex ? current : prev
            );
        } else if (windows.length > 0) {
            // No visible windows, but there are minimized windows
            // Use the most recently opened one (highest z-index overall)
            topWindow = windows.reduce((prev, current) =>
                current.zIndex > prev.zIndex ? current : prev
            );
        } else {
            // No windows at all, go to desktop
            const newPath = "/desktop";
            const currentPath = window.location.pathname;
            if (newPath !== currentPath) {
                isUpdatingUrl.current = true;
                // Use history API to update URL without triggering navigation/re-render
                window.history.replaceState(null, "", newPath);
                setTimeout(() => {
                    isUpdatingUrl.current = false;
                }, 0);
            }
            return;
        }

        const appId = topWindow.content.id;
        const isMaximized = topWindow.maximized ?? false;

        // Build new URL with /desktop prefix
        const newPath = `/desktop/${appId}`;
        const newSearchParams = new URLSearchParams();
        if (isMaximized) {
            newSearchParams.set("maximized", "true");
        }
        const newUrl =
            newSearchParams.toString() !== ""
                ? `${newPath}?${newSearchParams.toString()}`
                : newPath;

        // Only update if URL is different (compare against actual window.location to avoid stale values)
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentUrl = currentPath + currentSearch;

        if (newUrl !== currentUrl) {
            isUpdatingUrl.current = true;
            // Use history API to update URL without triggering navigation/re-render
            window.history.replaceState(null, "", newUrl);
            setTimeout(() => {
                isUpdatingUrl.current = false;
            }, 0);
        }
    }, [windows]);

    return null;
}
