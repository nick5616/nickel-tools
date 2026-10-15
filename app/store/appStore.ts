"use client";

import { create } from "zustand";
import type { Content } from "../data/content";

export const MENU_BAR_HEIGHT = 40;

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WindowState {
    id: string;
    content: Content;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    minimized: boolean;
    maximized?: boolean;
    snapped?: boolean;
    // Screen rect of the icon the window was launched from, for the zoom-in
    originRect?: Rect;
    previousPosition?: { x: number; y: number };
    previousSize?: { width: number; height: number };
    previousZIndex?: number;
}

// The focused window: highest z-index among those not minimized.
export function getFocusedWindow(windows: WindowState[]): WindowState | undefined {
    return windows
        .filter((w) => !w.minimized)
        .reduce<WindowState | undefined>(
            (top, w) => (!top || w.zIndex > top.zIndex ? w : top),
            undefined
        );
}

export type ViewFilter =
    | "all"
    | "engineering"
    | "music"
    | "art"
    | "immersive-web"
    | "social-tools"
    | "ai-tools"
    | "tools-only";
export type SortMethod = "date" | "category" | "name";

interface MenuState {
    viewFilter: ViewFilter;
    sortMethod: SortMethod;
    openMenus: {
        niIcon: boolean;
        view: boolean;
        art: boolean;
    };
}

interface AppState {
    windows: WindowState[];
    menu: MenuState;
    // Opens the app, or brings its existing window forward
    openWindow: (content: Content, originRect?: Rect) => void;
    // Dock behaviour: open, restore, focus, or minimize if already focused
    toggleWindowFromDock: (content: Content, originRect?: Rect) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    toggleMaximizeWindow: (id: string) => void;
    snapWindow: (id: string, rect: Rect) => void;
    focusWindow: (id: string) => void;
    updateWindowPosition: (
        id: string,
        position: { x: number; y: number }
    ) => void;
    updateWindowSize: (
        id: string,
        size: { width: number; height: number }
    ) => void;
    getNextZIndex: () => number;
    setViewFilter: (filter: ViewFilter) => void;
    setSortMethod: (method: SortMethod) => void;
    toggleMenu: (menu: keyof MenuState["openMenus"]) => void;
    closeAllMenus: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    windows: [],
    menu: {
        viewFilter: "all",
        sortMethod: "name",
        openMenus: {
            niIcon: false,
            view: false,
            art: false,
        },
    },
    openWindow: (content, originRect) => {
        const existingWindow = get().windows.find(
            (w) => w.content.id === content.id
        );
        if (existingWindow) {
            if (existingWindow.minimized) {
                get().minimizeWindow(existingWindow.id);
            }
            get().focusWindow(existingWindow.id);
            return;
        }

        // Determine window size with fallback priority:
        // 1. Content-specific windowWidth/windowHeight (if InternalApp)
        // 2. localStorage default window size
        // 3. Viewport-relative default (70vw × 72vh, min 600×450)
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const availableHeight = vh - MENU_BAR_HEIGHT;

        let windowWidth = Math.max(600, Math.round(vw * 0.7));
        let windowHeight = Math.max(450, Math.round(availableHeight * 0.72));

        const isInternalApp = content.type === "internal";
        const contentWidth = isInternalApp ? content.windowWidth : undefined;
        const contentHeight = isInternalApp ? content.windowHeight : undefined;

        if (contentWidth) {
            windowWidth = contentWidth;
        }
        if (contentHeight) {
            windowHeight = contentHeight;
        }

        // If content doesn't specify size, check localStorage
        if (!contentWidth || !contentHeight) {
            if (typeof window !== "undefined") {
                try {
                    const stored = localStorage.getItem(
                        "nickel-default-window-size"
                    );
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.width && !contentWidth) {
                            windowWidth = parsed.width;
                        }
                        if (parsed.height && !contentHeight) {
                            windowHeight = parsed.height;
                        }
                    }
                } catch (error) {
                    // Ignore localStorage errors, use defaults
                }
            }
        }

        // Keep the window on screen, cascading from the centre
        windowWidth = Math.min(windowWidth, vw - 32);
        windowHeight = Math.min(windowHeight, availableHeight - 96);
        const cascade = (get().windows.length % 6) * 28;
        const newWindow: WindowState = {
            id: `window-${Date.now()}`,
            content,
            position: {
                x: Math.max(16, Math.round((vw - windowWidth) / 2) - 60 + cascade),
                y: Math.max(12, Math.round((availableHeight - windowHeight) / 2) - 40 + cascade),
            },
            size: { width: windowWidth, height: windowHeight },
            zIndex: get().getNextZIndex(),
            minimized: false,
            maximized: false,
            originRect,
        };

        set({ windows: [...get().windows, newWindow] });
    },

    toggleWindowFromDock: (content, originRect) => {
        const existing = get().windows.find((w) => w.content.id === content.id);
        if (existing && !existing.minimized) {
            const focused = getFocusedWindow(get().windows);
            if (focused?.id === existing.id) {
                get().minimizeWindow(existing.id);
                return;
            }
        }
        get().openWindow(content, originRect);
    },

    snapWindow: (id, rect) => {
        set({
            windows: get().windows.map((w) =>
                w.id === id
                    ? {
                          ...w,
                          position: { x: rect.x, y: rect.y },
                          size: { width: rect.width, height: rect.height },
                          snapped: true,
                          maximized: false,
                          previousPosition: w.snapped
                              ? w.previousPosition
                              : w.position,
                          previousSize: w.snapped ? w.previousSize : w.size,
                      }
                    : w
            ),
        });
    },

    closeWindow: (id) => {
        set({ windows: get().windows.filter((w) => w.id !== id) });
    },

    minimizeWindow: (id) => {
        set({
            windows: get().windows.map((w) =>
                w.id === id ? { ...w, minimized: !w.minimized } : w
            ),
        });
    },

    toggleMaximizeWindow: (id) => {
        set({
            windows: get().windows.map((w) => {
                if (w.id !== id) return w;

                // If not currently maximized, store previous size/position and maximize
                if (!w.maximized) {
                    const previousPosition = w.position;
                    const previousSize = w.size;
                    const previousZIndex = w.zIndex;

                    // Fill the desktop area (the viewport below the menu bar).
                    // Positions are relative to that area, so the origin is 0,0.
                    const width =
                        typeof window !== "undefined"
                            ? window.innerWidth
                            : previousSize.width;
                    const height =
                        typeof window !== "undefined"
                            ? window.innerHeight - MENU_BAR_HEIGHT
                            : previousSize.height;

                    const maxZ = Math.max(
                        ...get().windows.map((w) => w.zIndex),
                        0
                    );

                    return {
                        ...w,
                        position: { x: 0, y: 0 },
                        size: { width, height },
                        zIndex: maxZ + 1,
                        maximized: true,
                        snapped: false,
                        // A snapped window restores to its pre-snap frame
                        previousPosition: w.snapped
                            ? w.previousPosition ?? previousPosition
                            : previousPosition,
                        previousSize: w.snapped
                            ? w.previousSize ?? previousSize
                            : previousSize,
                        previousZIndex,
                    };
                }

                // Restore from previous size/position if available
                return {
                    ...w,
                    position: w.previousPosition ?? w.position,
                    size: w.previousSize ?? w.size,
                    maximized: false,
                    previousPosition: undefined,
                    previousSize: undefined,
                    previousZIndex: undefined,
                };
            }),
        });
    },

    focusWindow: (id) => {
        const maxZ = Math.max(...get().windows.map((w) => w.zIndex), 0);
        set({
            windows: get().windows.map((w) =>
                w.id === id ? { ...w, zIndex: maxZ + 1 } : w
            ),
        });
    },

    updateWindowPosition: (id, position) => {
        set({
            windows: get().windows.map((w) =>
                w.id === id ? { ...w, position, snapped: false } : w
            ),
        });
    },

    updateWindowSize: (id, size) => {
        set({
            windows: get().windows.map((w) =>
                w.id === id ? { ...w, size } : w
            ),
        });
    },

    getNextZIndex: () => {
        const maxZ = Math.max(...get().windows.map((w) => w.zIndex), 20);
        return maxZ + 1;
    },

    setViewFilter: (filter) => {
        set({ menu: { ...get().menu, viewFilter: filter } });
        get().closeAllMenus();
    },

    setSortMethod: (method) => {
        set({ menu: { ...get().menu, sortMethod: method } });
        get().closeAllMenus();
    },

    toggleMenu: (menu) => {
        set((state) => {
            const currentState = state.menu.openMenus[menu];
            // Close all menus first
            const newOpenMenus = {
                niIcon: false,
                view: false,
                art: false,
            };
            // Then toggle the clicked menu
            newOpenMenus[menu] = !currentState;
            return {
                menu: { ...state.menu, openMenus: newOpenMenus },
            };
        });
    },

    closeAllMenus: () => {
        set({
            menu: {
                ...get().menu,
                openMenus: {
                    niIcon: false,
                    view: false,
                    art: false,
                },
            },
        });
    },
}));
