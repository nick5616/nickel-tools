"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { formatDate, type Content } from "@/app/data/content";

interface ContentInfoPopoverProps {
    content: Content;
    // Replaces the default click behaviour (pinning the popover open).
    onTriggerClick?: (e: React.MouseEvent) => void;
}

const PANEL_MAX_WIDTH = 360;
const VIEWPORT_GUTTER = 16;
const CLOSE_DELAY_MS = 150;

const headingClass =
    "text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]";

function GitHubIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 fill-current"
            aria-hidden="true"
        >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

// Info icon for an app window's title bar. Hover, focus, or click reveals the
// app's description plus its details from content.ts (date, why, tech, tags,
// source links). The panel is portaled to <body> so the window's transform
// and overflow don't clip it.
export function ContentInfoPopover({
    content,
    onTriggerClick,
}: ContentInfoPopoverProps) {
    const [open, setOpen] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [position, setPosition] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    const { title, description, date, why, source, backendSource } = content;
    const tech = content.tech ?? [];
    const mediums = content.mediums ?? [];
    const tags = content.tags ?? [];
    const sourceLinks = [
        source && { href: source, label: backendSource ? "Frontend" : "Source" },
        backendSource && { href: backendSource, label: "Backend" },
    ].filter((link): link is { href: string; label: string } => !!link);

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const width = Math.min(PANEL_MAX_WIDTH, vw - VIEWPORT_GUTTER * 2);
        const left = Math.min(
            Math.max(rect.left, VIEWPORT_GUTTER),
            vw - VIEWPORT_GUTTER - width,
        );
        // Open toward whichever side of the viewport has more room.
        const openAbove = rect.top > vh - rect.bottom;
        setPosition({
            left,
            width,
            ...(openAbove
                ? { bottom: vh - rect.top + 8, maxHeight: rect.top - 24 }
                : { top: rect.bottom + 8, maxHeight: vh - rect.bottom - 24 }),
        });
    }, []);

    const cancelClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = null;
    };

    const show = () => {
        cancelClose();
        updatePosition();
        setOpen(true);
    };

    const scheduleClose = () => {
        if (pinned) return;
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    };

    const close = useCallback(() => {
        setOpen(false);
        setPinned(false);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            if (
                !triggerRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                close();
            }
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, close, updatePosition]);

    useEffect(() => cancelClose, []);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label={`More info about ${title}`}
                aria-expanded={open}
                onMouseEnter={show}
                onMouseLeave={scheduleClose}
                onFocus={show}
                onBlur={() => {
                    // Clicking a link in the panel blurs the trigger first.
                    if (!panelRef.current?.matches(":hover")) scheduleClose();
                }}
                // Keep the title bar from starting a window drag.
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onTriggerClick) {
                        close();
                        onTriggerClick(e);
                    } else if (pinned) {
                        close();
                    } else {
                        show();
                        setPinned(true);
                    }
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors cursor-pointer"
            >
                <Info size={14} />
            </button>
            {open &&
                createPortal(
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-label={`${title} details`}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                        style={position}
                        className="fixed z-[10001] overflow-y-auto rounded-lg border border-[rgb(var(--border-window))] bg-[rgb(var(--bg-window))] text-[rgb(var(--text-primary))] p-4 shadow-2xl text-sm space-y-4"
                    >
                        <div className="space-y-1">
                            {date && (
                                <p className="text-xs text-[rgb(var(--text-secondary))]">
                                    {formatDate(date)}
                                </p>
                            )}
                            <p className="leading-relaxed">{description}</p>
                        </div>
                        {why && (
                            <section className="space-y-1.5">
                                <h4 className={headingClass}>Why I Built It</h4>
                                <p className="leading-relaxed text-[rgb(var(--text-secondary))]">
                                    {why}
                                </p>
                            </section>
                        )}
                        {tech.length > 0 && (
                            <ChipSection label="Technologies" items={tech} />
                        )}
                        {mediums.length > 0 && (
                            <ChipSection label="Mediums" items={mediums} />
                        )}
                        {tags.length > 0 && (
                            <ChipSection label="Tags" items={tags} />
                        )}
                        {sourceLinks.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {sourceLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[rgb(var(--border-window))] bg-[rgb(var(--bg-button))] hover:bg-[rgb(var(--bg-button-hover))] text-xs font-medium transition-colors"
                                    >
                                        <GitHubIcon />
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        {onTriggerClick && (
                            <p className="text-xs text-[rgb(var(--text-secondary))]">
                                Click the icon for the full write-up.
                            </p>
                        )}
                    </div>,
                    document.body,
                )}
        </>
    );
}

function ChipSection({ label, items }: { label: string; items: string[] }) {
    return (
        <section className="space-y-1.5">
            <h4 className={headingClass}>{label}</h4>
            <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                    <span
                        key={item}
                        className="px-2 py-0.5 rounded-full border border-[rgb(var(--border-window))] bg-[rgb(var(--bg-desktop))] text-xs text-[rgb(var(--text-secondary))]"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </section>
    );
}
