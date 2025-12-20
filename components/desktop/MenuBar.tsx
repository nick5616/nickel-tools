"use client";

import React, { useRef } from "react";
import { useTheme } from "next-themes";
import {
    Moon,
    Sun,
    Folder,
    Info,
    Mail,
    Image,
    Paintbrush,
    PenTool,
    Hand,
    Settings,
    FileText,
    Layers,
} from "lucide-react";
import { MenuDropdown, type MenuItem } from "./MenuDropdown";
import { useAppStore } from "@/app/store/appStore";
import { getContentById } from "@/app/data/content";

export function MenuBar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const niIconRef = useRef<HTMLDivElement>(null);
    const viewMenuRef = useRef<HTMLButtonElement>(null);
    const artMenuRef = useRef<HTMLButtonElement>(null);
    const toolsMenuRef = useRef<HTMLButtonElement>(null);

    const { menu, toggleMenu, setViewFilter, setSortMethod, openWindow } =
        useAppStore();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleOpenSystemWindow = (id: string) => {
        const content = getContentById(id);
        if (content) {
            openWindow(content);
        }
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

    const viewMenuItems: MenuItem[] = [
        {
            label: "All Projects",
            onClick: () => setViewFilter("all"),
            checked: menu.viewFilter === "all",
        },
        {
            label: "Engineering Only",
            onClick: () => setViewFilter("engineering"),
            checked: menu.viewFilter === "engineering",
        },
        {
            label: "Music Only",
            onClick: () => setViewFilter("music"),
            checked: menu.viewFilter === "music",
        },
        {
            label: "Art Only",
            onClick: () => setViewFilter("art"),
            checked: menu.viewFilter === "art",
        },
        {
            label: "Immersive Web Only",
            onClick: () => setViewFilter("immersive-web"),
            checked: menu.viewFilter === "immersive-web",
        },
        {
            label: "Social Tools Only",
            onClick: () => setViewFilter("social-tools"),
            checked: menu.viewFilter === "social-tools",
        },
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
        {
            label: "Digital Art",
            onClick: () => handleOpenSystemWindow("art-digital-art"),
            icon: <Image size={14} />,
        },
        {
            label: "Paintings",
            onClick: () => handleOpenSystemWindow("art-paintings"),
            icon: <Paintbrush size={14} />,
        },
        {
            label: "Sketches",
            onClick: () => handleOpenSystemWindow("art-sketches"),
            icon: <PenTool size={14} />,
        },
        {
            label: "Left-Handed Art",
            onClick: () => handleOpenSystemWindow("art-lefthanded"),
            icon: <Hand size={14} />,
        },
        {
            label: "Miscellaneous",
            onClick: () => handleOpenSystemWindow("art-miscellaneous"),
            icon: <Folder size={14} />,
        },
        {
            label: "Notes App Art",
            onClick: () => handleOpenSystemWindow("art-notesappart"),
            icon: <FileText size={14} />,
        },
    ];

    const toolsMenuItems: MenuItem[] = [
        {
            label: "Show Only Tools",
            onClick: () => {
                if (menu.viewFilter === "tools-only") {
                    setViewFilter("all");
                } else {
                    setViewFilter("tools-only");
                }
            },
            checked: menu.viewFilter === "tools-only",
        },
    ];

    const getMenuPosition = (ref: React.RefObject<HTMLElement | null>) => {
        if (!ref.current) return { top: 48, left: 0 };
        const rect = ref.current.getBoundingClientRect();
        return {
            top: rect.bottom + 4,
            left: rect.left,
        };
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-[rgb(var(--bg-menubar))]/80 backdrop-blur-xl border-b border-[rgb(var(--border-window))] px-4 py-2 flex items-center justify-between z-50 h-12">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 relative">
                    <div
                        ref={niIconRef}
                        onClick={() => toggleMenu("niIcon")}
                        className=" w-8 h-8 bg-[rgb(var(--bg-titlebar))] rounded flex items-center justify-center font-mono text-sm font-bold text-[rgb(var(--text-menubar))] cursor-pointer hover:bg-[rgb(var(--bg-menubar-hover))] transition-colors"
                    >
                        Ni
                    </div>
                    <MenuDropdown
                        isOpen={menu.openMenus.niIcon}
                        onClose={() => toggleMenu("niIcon")}
                        items={niIconMenuItems}
                        position={getMenuPosition(niIconRef)}
                        triggerRef={niIconRef}
                    />
                    <span className="font-bold font-bbh-bartle text-[rgb(var(--text-menubar))]">
                        NICKEL
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-s text-[rgb(var(--text-menubar))]/70 relative">
                    <button
                        ref={viewMenuRef}
                        onClick={() => toggleMenu("view")}
                        className={`hover:text-[rgb(var(--text-menubar))] transition-colors px-2 py-1 rounded ${
                            menu.openMenus.view
                                ? "bg-[rgb(var(--bg-menubar-hover))] text-[rgb(var(--text-menubar))]"
                                : ""
                        }`}
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
                        className={`hover:text-[rgb(var(--text-menubar))] transition-colors px-2 py-1 rounded ${
                            menu.openMenus.art
                                ? "bg-[rgb(var(--bg-menubar-hover))] text-[rgb(var(--text-menubar))]"
                                : ""
                        }`}
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
                    <button
                        ref={toolsMenuRef}
                        onClick={() => toggleMenu("tools")}
                        className={`hover:text-[rgb(var(--text-menubar))] transition-colors px-2 py-1 rounded ${
                            menu.openMenus.tools
                                ? "bg-[rgb(var(--bg-menubar-hover))] text-[rgb(var(--text-menubar))]"
                                : ""
                        }`}
                    >
                        Tools
                    </button>
                    <MenuDropdown
                        isOpen={menu.openMenus.tools}
                        onClose={() => toggleMenu("tools")}
                        items={toolsMenuItems}
                        position={getMenuPosition(toolsMenuRef)}
                        triggerRef={toolsMenuRef}
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs font-bbh-bartle text-[rgb(var(--text-menubar))]/60">
                    ELEMENT 28
                </span>

                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded hover:bg-[rgb(var(--bg-menubar-hover))] flex items-center justify-center transition-colors"
                    aria-label="Toggle theme"
                >
                    {mounted && theme === "dark" ? (
                        <Sun
                            size={16}
                            className="text-[rgb(var(--text-menubar))]"
                        />
                    ) : (
                        <Moon
                            size={16}
                            className="text-[rgb(var(--text-menubar))]"
                        />
                    )}
                </button>
            </div>
        </div>
    );
}
