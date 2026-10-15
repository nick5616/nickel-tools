"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Folder,
    Info,
    Mail,
    Image,
    Paintbrush,
    PenTool,
    Hand,
    Settings,
    FileText,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import { MenuDropdown, type MenuItem } from "./MenuDropdown";
import { ControlCenter } from "./ControlCenter";
import {
    useAppStore,
    getFocusedWindow,
    MENU_BAR_HEIGHT,
} from "@/app/store/appStore";
import { useSystemStore } from "@/app/store/systemStore";
import { getContentById } from "@/app/data/content";

function useClock() {
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 15_000);
        return () => clearInterval(id);
    }, []);
    return now;
}

export function MenuBar() {
    const niIconRef = useRef<HTMLButtonElement>(null);
    const viewMenuRef = useRef<HTMLButtonElement>(null);
    const artMenuRef = useRef<HTMLButtonElement>(null);
    const now = useClock();

    const {
        menu,
        windows,
        toggleMenu,
        setViewFilter,
        setSortMethod,
        openWindow,
    } = useAppStore();
    const {
        useStacks,
        setUseStacks,
        controlCenterOpen,
        setControlCenterOpen,
        setSpotlightOpen,
    } = useSystemStore();

    const focused = getFocusedWindow(windows);

    const handleOpenSystemWindow = (id: string) => {
        const content = getContentById(id);
        if (content) openWindow(content);
    };

    const niIconMenuItems: MenuItem[] = [
        {
            label: "About",
            onClick: () => handleOpenSystemWindow("about"),
            icon: <Info size={14} />,
        },
        {
            label: "Contact",
            onClick: () => handleOpenSystemWindow("contact"),
            icon: <Mail size={14} />,
        },
        {
            label: "Settings",
            onClick: () => handleOpenSystemWindow("settings"),
            icon: <Settings size={14} />,
        },
    ];

    const filter = (label: string, value: typeof menu.viewFilter): MenuItem => ({
        label,
        onClick: () => setViewFilter(value),
        checked: menu.viewFilter === value,
    });

    const viewMenuItems: MenuItem[] = [
        {
            label: "Use Stacks",
            onClick: () => setUseStacks(!useStacks),
            checked: useStacks,
        },
        { separator: true },
        filter("All Projects", "all"),
        filter("Tools Only", "tools-only"),
        filter("Engineering", "engineering"),
        filter("Music", "music"),
        filter("Art", "art"),
        filter("Immersive Web", "immersive-web"),
        filter("Social Tools", "social-tools"),
        filter("AI Tools", "ai-tools"),
        { separator: true },
        {
            label: "Sort by Date",
            onClick: () => setSortMethod("date"),
            radio: true,
            checked: menu.sortMethod === "date",
        },
        {
            label: "Sort by Category",
            onClick: () => setSortMethod("category"),
            radio: true,
            checked: menu.sortMethod === "category",
        },
        {
            label: "Sort by Name",
            onClick: () => setSortMethod("name"),
            radio: true,
            checked: menu.sortMethod === "name",
        },
    ];

    const artMenuItems: MenuItem[] = [
        { label: "Digital Art", onClick: () => handleOpenSystemWindow("art-digital-art"), icon: <Image size={14} /> },
        { label: "Paintings", onClick: () => handleOpenSystemWindow("art-paintings"), icon: <Paintbrush size={14} /> },
        { label: "Sketches", onClick: () => handleOpenSystemWindow("art-sketches"), icon: <PenTool size={14} /> },
        { label: "Left-Handed Art", onClick: () => handleOpenSystemWindow("art-lefthanded"), icon: <Hand size={14} /> },
        { label: "Miscellaneous", onClick: () => handleOpenSystemWindow("art-miscellaneous"), icon: <Folder size={14} /> },
        { label: "Notes App Art", onClick: () => handleOpenSystemWindow("art-notesappart"), icon: <FileText size={14} /> },
    ];

    const getMenuPosition = (ref: React.RefObject<HTMLElement | null>) => {
        if (!ref.current) return { top: MENU_BAR_HEIGHT, left: 0 };
        const rect = ref.current.getBoundingClientRect();
        return { top: rect.bottom + 2, left: rect.left };
    };

    const menuButton = (open: boolean) =>
        `px-2.5 h-7 rounded-md transition-colors ${
            open
                ? "bg-[rgb(var(--text-menubar)/0.12)]"
                : "hover:bg-[rgb(var(--text-menubar)/0.08)]"
        }`;

    return (
        <div
            className="nk-menubar fixed top-0 left-0 right-0 px-2 flex items-center justify-between z-[10000] text-[13px] text-[rgb(var(--text-menubar))]"
            style={{ height: MENU_BAR_HEIGHT }}
        >
            <div className="flex items-center gap-1">
                {/* The Ni element tile is the system menu */}
                <button
                    ref={niIconRef}
                    onClick={() => toggleMenu("niIcon")}
                    className={`${menuButton(menu.openMenus.niIcon)} !px-1.5`}
                    aria-label="Nickel menu"
                >
                    <span
                        className="nk-tile relative flex items-center justify-center w-6 h-6 font-sans font-black tracking-tight text-[11px] leading-none"
                        style={{ ["--tile-hue" as string]: "var(--nk-h1)" }}
                    >
                        Ni
                    </span>
                </button>
                <MenuDropdown
                    isOpen={menu.openMenus.niIcon}
                    onClose={() => toggleMenu("niIcon")}
                    items={niIconMenuItems}
                    position={getMenuPosition(niIconRef)}
                    triggerRef={niIconRef}
                />

                <span className="px-2 font-bold truncate max-w-[220px]">
                    {focused?.content.title ?? "Nickel"}
                </span>

                <div className="hidden md:flex items-center">
                    <button
                        ref={viewMenuRef}
                        onClick={() => toggleMenu("view")}
                        className={menuButton(menu.openMenus.view)}
                    >
                        View
                    </button>
                    <MenuDropdown
                        isOpen={menu.openMenus.view}
                        onClose={() => toggleMenu("view")}
                        items={viewMenuItems}
                        position={getMenuPosition(viewMenuRef)}
                        triggerRef={viewMenuRef}
                    />
                    <button
                        ref={artMenuRef}
                        onClick={() => toggleMenu("art")}
                        className={menuButton(menu.openMenus.art)}
                    >
                        Art
                    </button>
                    <MenuDropdown
                        isOpen={menu.openMenus.art}
                        onClose={() => toggleMenu("art")}
                        items={artMenuItems}
                        position={getMenuPosition(artMenuRef)}
                        triggerRef={artMenuRef}
                    />
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => setSpotlightOpen(true)}
                    className={menuButton(false)}
                    aria-label="Search (⌘K)"
                    title="Search (⌘K)"
                >
                    <Search size={15} />
                </button>
                <button
                    onClick={() => setControlCenterOpen(!controlCenterOpen)}
                    className={menuButton(controlCenterOpen)}
                    aria-label="Control Center"
                    title="Control Center"
                    data-control-center-trigger
                >
                    <SlidersHorizontal size={15} />
                </button>
                <span className="px-2 tabular-nums font-medium whitespace-nowrap">
                    {now &&
                        now.toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                </span>
            </div>

            <ControlCenter />
        </div>
    );
}
