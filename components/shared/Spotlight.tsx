"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { CornerDownLeft, Image as ImageIcon, Moon, Palette, Search, Sun } from "lucide-react";
import { getAllContent, getContentById, type Content } from "@/app/data/content";
import { PALETTE_PRESETS, applyPreset } from "@/app/utils/nickelPalette";
import { WALLPAPERS, useSystemStore } from "@/app/store/systemStore";
import { AppTile } from "./AppTile";
import { springs } from "./motion";

interface SpotlightProps {
    onOpenContent: (content: Content) => void;
    mobile?: boolean;
}

type Result =
    | { kind: "app"; id: string; content: Content; score: number }
    | {
          kind: "action";
          id: string;
          label: string;
          hint: string;
          icon: React.ReactNode;
          run: () => void;
          score: number;
      };

function scoreText(query: string, text: string | undefined, weight: number) {
    if (!text) return 0;
    const t = text.toLowerCase();
    if (t === query) return weight * 4;
    if (t.startsWith(query)) return weight * 3;
    if (t.split(/[\s/-]+/).some((w) => w.startsWith(query))) return weight * 2;
    if (t.includes(query)) return weight;
    return 0;
}

export function Spotlight({ onOpenContent, mobile = false }: SpotlightProps) {
    const { spotlightOpen: open, setSpotlightOpen } = useSystemStore();

    // ⌘K / Ctrl+K anywhere
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSpotlightOpen(!useSystemStore.getState().spotlightOpen);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setSpotlightOpen]);

    // The panel mounts fresh on every open, so its query starts empty
    return (
        <AnimatePresence>
            {open && (
                <SpotlightPanel
                    onOpenContent={onOpenContent}
                    mobile={mobile}
                    close={() => setSpotlightOpen(false)}
                />
            )}
        </AnimatePresence>
    );
}

function SpotlightPanel({
    onOpenContent,
    mobile,
    close,
}: SpotlightProps & { close: () => void }) {
    const setWallpaper = useSystemStore((s) => s.setWallpaper);
    const { setTheme, resolvedTheme } = useTheme();
    const [query, setQuery] = useState("");
    const [index, setIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const allContent = useMemo(() => getAllContent(), []);

    const results = useMemo<Result[]>(() => {
        const q = query.trim().toLowerCase();
        const isDark = resolvedTheme === "dark";

        const actions: Result[] = [
            {
                kind: "action",
                id: "mode",
                label: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
                hint: "Appearance",
                icon: isDark ? <Sun size={18} /> : <Moon size={18} />,
                run: () => setTheme(isDark ? "light" : "dark"),
                score: 0,
            },
            ...PALETTE_PRESETS.map<Result>((preset) => ({
                kind: "action",
                id: `palette-${preset.id}`,
                label: `Palette: ${preset.name}`,
                hint: preset.scheme ?? "default",
                icon: <Palette size={18} />,
                run: () => applyPreset(preset, isDark),
                score: 0,
            })),
            ...WALLPAPERS.map<Result>((w) => ({
                kind: "action",
                id: `wall-${w.id}`,
                label: `Wallpaper: ${w.name}`,
                hint: w.blurb,
                icon: <ImageIcon size={18} />,
                run: () => setWallpaper(w.id),
                score: 0,
            })),
            {
                kind: "action",
                id: "color-engine",
                label: "Open Color Engine",
                hint: "Build your own scheme",
                icon: <Palette size={18} />,
                run: () => {
                    const settings = getContentById("settings");
                    if (settings) onOpenContent(settings);
                },
                score: 0,
            },
        ];

        if (!q) {
            // Empty query: newest apps, then a few handy actions
            const recent = [...allContent]
                .sort(
                    (a, b) =>
                        (new Date(b.date ?? 0).getTime() || 0) -
                        (new Date(a.date ?? 0).getTime() || 0)
                )
                .slice(0, 6)
                .map<Result>((content) => ({ kind: "app", id: content.id, content, score: 0 }));
            return [...recent, actions[0], actions[actions.length - 1]];
        }

        const apps = allContent
            .map<Result>((content) => ({
                kind: "app",
                id: content.id,
                content,
                score:
                    scoreText(q, content.title, 10) +
                    scoreText(q, content.category, 4) +
                    (content.tags ?? []).reduce((s, t) => s + scoreText(q, t, 2), 0) +
                    (content.tech ?? []).reduce((s, t) => s + scoreText(q, t, 2), 0) +
                    scoreText(q, content.description, 1),
            }))
            .filter((r) => r.score > 0);

        const matchedActions = actions
            .map((a) =>
                a.kind === "action"
                    ? { ...a, score: scoreText(q, a.label, 6) + scoreText(q, a.hint, 2) }
                    : a
            )
            .filter((r) => r.score > 0);

        return [...apps, ...matchedActions]
            .sort((a, b) => b.score - a.score)
            .slice(0, 9);
    }, [query, allContent, resolvedTheme, setTheme, setWallpaper, onOpenContent]);

    const run = (result: Result | undefined) => {
        if (!result) return;
        close();
        if (result.kind === "app") onOpenContent(result.content);
        else result.run();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => Math.min(results.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            run(results[index]);
        } else if (e.key === "Escape") {
            close();
        }
    };

    useEffect(() => {
        listRef.current
            ?.querySelector(`[data-index="${index}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [index]);

    return (
                <motion.div
                    className="fixed inset-0 z-[20000] flex justify-center"
                    style={{
                        paddingTop: mobile
                            ? "calc(env(safe-area-inset-top, 0px) + 56px)"
                            : "18vh",
                        paddingLeft: 12,
                        paddingRight: 12,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onPointerDown={(e) => {
                        if (e.target === e.currentTarget) close();
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
                        onClick={close}
                    />
                    <motion.div
                        className="nk-material-thick w-full max-w-[640px] h-fit rounded-2xl overflow-hidden text-[rgb(var(--text-primary))]"
                        initial={{ opacity: 0, scale: 0.96, y: mobile ? -16 : -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        transition={springs.snappy}
                        role="dialog"
                        aria-label="Search"
                    >
                        <div className="flex items-center gap-3 px-4 h-14">
                            <Search size={20} className="text-[rgb(var(--text-secondary))] shrink-0" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setIndex(0);
                                }}
                                onKeyDown={onKeyDown}
                                placeholder="Search apps, art, palettes…"
                                className="flex-1 bg-transparent outline-none text-lg placeholder:text-[rgb(var(--text-secondary))]"
                                aria-label="Search"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            {!mobile && (
                                <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-[rgb(var(--text-primary)/0.08)] text-[rgb(var(--text-secondary))]">
                                    esc
                                </kbd>
                            )}
                            {mobile && (
                                <button onClick={close} className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                    Cancel
                                </button>
                            )}
                        </div>
                        {results.length > 0 && (
                            <div
                                ref={listRef}
                                className="border-t border-[rgb(var(--text-primary)/0.08)] max-h-[52vh] overflow-y-auto p-1.5"
                            >
                                {!query && (
                                    <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                                        Recently added
                                    </div>
                                )}
                                {results.map((result, i) => {
                                    const active = i === index;
                                    return (
                                        <button
                                            key={result.id}
                                            data-index={i}
                                            onMouseMove={() => setIndex(i)}
                                            onClick={() => run(result)}
                                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left ${
                                                active
                                                    ? "bg-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-fg-l))] text-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-bg-l))]"
                                                    : ""
                                            }`}
                                        >
                                            {result.kind === "app" ? (
                                                <AppTile content={result.content} size={34} showNumber={false} />
                                            ) : (
                                                <span className="w-[34px] h-[34px] rounded-[26%] flex items-center justify-center bg-[rgb(var(--text-primary)/0.08)]">
                                                    {result.icon}
                                                </span>
                                            )}
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-medium truncate">
                                                    {result.kind === "app" ? result.content.title : result.label}
                                                </span>
                                                <span className={`block text-xs truncate ${active ? "opacity-80" : "text-[rgb(var(--text-secondary))]"}`}>
                                                    {result.kind === "app" ? result.content.category : result.hint}
                                                </span>
                                            </span>
                                            {active && !mobile && <CornerDownLeft size={14} className="opacity-70" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {query && results.length === 0 && (
                            <div className="border-t border-[rgb(var(--text-primary)/0.08)] px-4 py-6 text-sm text-center text-[rgb(var(--text-secondary))]">
                                Nothing on the periodic table matches “{query}”.
                            </div>
                        )}
                    </motion.div>
                </motion.div>
    );
}
