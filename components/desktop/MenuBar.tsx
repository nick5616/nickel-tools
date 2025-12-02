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
    Settings,
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
        <div className="fixed top-0 left-0 right-0 bg-zinc-900/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-700 dark:border-zinc-800 px-4 py-2 flex items-center justify-between z-50 h-12">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 relative">
                    <div
                        ref={niIconRef}
                        onClick={() => toggleMenu("niIcon")}
                        className="w-8 h-8 bg-zinc-700 dark:bg-zinc-800 rounded flex items-center justify-center font-mono text-sm font-bold text-white cursor-pointer hover:bg-zinc-600 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Ni
                    </div>
                    <MenuDropdown
                        isOpen={menu.openMenus.niIcon}
                        onClose={() => toggleMenu("niIcon")}
                        items={niIconMenuItems}
                        position={getMenuPosition(niIconRef)}
                    />
                    <span className="font-bold text-white">NICKEL</span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-400 relative">
                    <button
                        ref={viewMenuRef}
                        onClick={() => toggleMenu("view")}
                        className={`hover:text-zinc-200 transition-colors px-2 py-1 rounded ${
                            menu.openMenus.view
                                ? "bg-zinc-800 text-zinc-200"
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
                    />
                    <button
                        ref={artMenuRef}
                        onClick={() => toggleMenu("art")}
                        className={`hover:text-zinc-200 transition-colors px-2 py-1 rounded ${
                            menu.openMenus.art
                                ? "bg-zinc-800 text-zinc-200"
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
                    />
                    <button
                        ref={toolsMenuRef}
                        onClick={() => toggleMenu("tools")}
                        className={`hover:text-zinc-200 transition-colors px-2 py-1 rounded ${
                            menu.openMenus.tools
                                ? "bg-zinc-800 text-zinc-200"
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
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500 font-mono">
                    ELEMENT 28 / FOUNDRY
                </span>

                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    aria-label="Toggle theme"
                >
                    {mounted && theme === "dark" ? (
                        <Sun size={16} className="text-zinc-300" />
                    ) : (
                        <Moon size={16} className="text-zinc-300" />
                    )}
                </button>
            </div>
        </div>
    );
}
