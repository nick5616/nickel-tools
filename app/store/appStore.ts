"use client";

import { create } from "zustand";
import type { Content } from "../data/content";

export interface WindowState {
    id: string;
    content: Content;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    minimized: boolean;
    maximized?: boolean;
    previousPosition?: { x: number; y: number };
    previousSize?: { width: number; height: number };
    previousZIndex?: number;
}

export type ViewFilter =
    | "all"
    | "engineering"
    | "music"
    | "art"
    | "immersive-web"
    | "social-tools"
    | "tools-only";
export type SortMethod = "date" | "category" | "name";

interface MenuState {
    viewFilter: ViewFilter;
    sortMethod: SortMethod;
    openMenus: {
        niIcon: boolean;
        view: boolean;
        art: boolean;
        tools: boolean;
    };
}

interface AppState {
    windows: WindowState[];
    menu: MenuState;
    openWindow: (content: Content) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    toggleMaximizeWindow: (id: string) => void;
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
        sortMethod: "category",
        openMenus: {
            niIcon: false,
            view: false,
            art: false,
            tools: false,
        },
    },

    openWindow: (content) => {
        const existingWindow = get().windows.find(
            (w) => w.content.id === content.id
        );
        if (existingWindow) {
            // If window is minimized, un-minimize and focus it
            if (existingWindow.minimized) {
                get().minimizeWindow(existingWindow.id);
                get().focusWindow(existingWindow.id);
            } else {
                // If window is not minimized, minimize it
                get().minimizeWindow(existingWindow.id);
            }
            return;
        }

        // Determine window size with fallback priority:
        // 1. Content-specific windowWidth/windowHeight (if InternalApp)
        // 2. localStorage default window size
        // 3. Default 800x600
        let windowWidth = 800;
        let windowHeight = 600;

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

        const newWindow: WindowState = {
            id: `window-${Date.now()}`,
            content,
            position: {
                x: 100 + get().windows.length * 30,
                y: 100 + get().windows.length * 30,
            },
            size: { width: windowWidth, height: windowHeight },
            zIndex: get().getNextZIndex(),
            minimized: false,
            maximized: false,
        };

        set({ windows: [...get().windows, newWindow] });
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

                    // Fill the entire desktop area (full viewport minus menu bar)
                    // The desktop area is h-[calc(100vh-48px)], so we use that height
                    const width =
                        typeof window !== "undefined"
                            ? window.innerWidth
                            : previousSize.width;
                    const height =
                        typeof window !== "undefined"
                            ? window.innerHeight - 48
                            : previousSize.height;

                    // Set a very high z-index to be above the dock (z-40)
                    const maxZ = Math.max(
                        ...get().windows.map((w) => w.zIndex),
                        0
                    );
                    const newZIndex = Math.max(maxZ + 1, 50);

                    return {
                        ...w,
                        // Position below the MenuBar (48px) so title bar is visible
                        // The desktop area has pt-12 padding, but absolutely positioned elements ignore it
                        position: { x: 0, y: 48 },
                        size: { width, height },
                        zIndex: newZIndex,
                        maximized: true,
                        previousPosition,
                        previousSize,
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
                    zIndex: w.previousZIndex ?? w.zIndex,
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
                w.id === id ? { ...w, position } : w
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
        const currentState = get().menu.openMenus[menu];
        // Close all menus first
        const newOpenMenus = {
            niIcon: false,
            view: false,
            art: false,
            tools: false,
        };
        // Then toggle the clicked menu
        newOpenMenus[menu] = !currentState;
        set({ menu: { ...get().menu, openMenus: newOpenMenus } });
    },

    closeAllMenus: () => {
        set({
            menu: {
                ...get().menu,
                openMenus: {
                    niIcon: false,
                    view: false,
                    art: false,
                    tools: false,
                },
            },
        });
    },
}));
