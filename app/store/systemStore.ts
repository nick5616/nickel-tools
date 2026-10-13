"use client";

import { create } from "zustand";

export type WallpaperId = "aurora" | "plated" | "lattice" | "arc";

export const WALLPAPERS: { id: WallpaperId; name: string; blurb: string }[] = [
    { id: "aurora", name: "Aurora", blurb: "Slow-drifting palette light" },
    { id: "plated", name: "Plated", blurb: "Brushed nickel that catches the light" },
    { id: "lattice", name: "Lattice", blurb: "Nickel's face-centred cubic crystal" },
    { id: "arc", name: "Arc", blurb: "Live electric arcs between atoms" },
];

const WALLPAPER_STORAGE_KEY = "nickel-wallpaper";
const STACKS_STORAGE_KEY = "nickel-desktop-stacks";

function readStorage(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Private mode or blocked storage: the preference just won't persist.
    }
}

interface SystemState {
    hydrated: boolean;
    wallpaper: WallpaperId;
    useStacks: boolean;
    spotlightOpen: boolean;
    controlCenterOpen: boolean;
    hydrate: () => void;
    setWallpaper: (id: WallpaperId) => void;
    setUseStacks: (value: boolean) => void;
    setSpotlightOpen: (open: boolean) => void;
    setControlCenterOpen: (open: boolean) => void;
}

export const useSystemStore = create<SystemState>((set, get) => ({
    hydrated: false,
    wallpaper: "aurora",
    useStacks: true,
    spotlightOpen: false,
    controlCenterOpen: false,

    // Called once on the client; keeps server and first client render equal.
    hydrate: () => {
        if (get().hydrated) return;
        const wallpaper = readStorage(WALLPAPER_STORAGE_KEY) as WallpaperId | null;
        const stacks = readStorage(STACKS_STORAGE_KEY);
        set({
            hydrated: true,
            wallpaper: WALLPAPERS.some((w) => w.id === wallpaper)
                ? wallpaper!
                : "aurora",
            useStacks: stacks === null ? true : stacks === "true",
        });
    },
    setWallpaper: (id) => {
        writeStorage(WALLPAPER_STORAGE_KEY, id);
        set({ wallpaper: id });
    },
    setUseStacks: (value) => {
        writeStorage(STACKS_STORAGE_KEY, String(value));
        set({ useStacks: value });
    },
    setSpotlightOpen: (open) =>
        set({ spotlightOpen: open, controlCenterOpen: false }),
    setControlCenterOpen: (open) =>
        set({ controlCenterOpen: open, spotlightOpen: false }),
}));
