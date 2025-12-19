"use client";

import React from "react";
import { motion } from "framer-motion";
import { getContentById } from "@/app/data/content";
import { IconRenderer } from "@/components/shared/IconRenderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RevolvingText } from "@/components/shared/RevolvingText";
import { useDeviceType } from "@/app/hooks/useDeviceType";

interface AppTrayProps {
    variant?: "fixed" | "relative";
}

export function AppTray({ variant = "fixed" }: AppTrayProps = {}) {
    const pathname = usePathname();
    const isMobile = useDeviceType();
    // Get the three apps for the tray
    const portfolio = getContentById("portfolio");
    const digitalArt = getContentById("art-digital-art");
    const settings = getContentById("settings");

    const trayApps = [portfolio, digitalArt, settings].filter(
        (app): app is NonNullable<typeof app> => app !== undefined
    );

    // Debug: Log to see if apps are found
    React.useEffect(() => {
        console.log("AppTray rendered", {
            trayAppsCount: trayApps.length,
            portfolio: !!portfolio,
            digitalArt: !!digitalArt,
            settings: !!settings,
            variant,
        });
    }, [trayApps.length, portfolio, digitalArt, settings, variant]);

    // Always render something visible for debugging
    if (trayApps.length === 0) {
        console.warn("AppTray: No apps found", {
            portfolio,
            digitalArt,
            settings,
        });
        return (
            <div
                className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 z-[99999] text-center font-bold"
                style={{ position: "fixed", zIndex: 99999 }}
            >
                AppTray: No apps found - check console. Portfolio:{" "}
                {portfolio ? "found" : "missing"}, Digital Art:{" "}
                {digitalArt ? "found" : "missing"}, Settings:{" "}
                {settings ? "found" : "missing"}
            </div>
        );
    }

    const containerStyle = {
        position: "fixed" as const,
        bottom: isMobile ? 0 : 16, // bottom-0 for mobile, bottom-4 (16px) for desktop
        left: 0,
        right: 0,
        zIndex: 99999,
        width: "100%",
        height: "auto",
    };

    // Desktop: compact size like Dock, Mobile: full-width
    const isDesktop = !isMobile;
    const iconSize = isDesktop ? "md" : "lg";
    const iconSizePx = isDesktop ? 40 : 48;
    const containerPadding = isDesktop ? "px-3 py-2" : "p-2 py-4";
    const containerMargin = isDesktop ? "m-0" : "m-2";
    const containerMinHeight = isDesktop ? "auto" : "80px";
    const containerWidth = isDesktop ? "auto" : "100%";
    const containerMaxWidth = isDesktop ? "none" : "100%";
    const gapSize = isDesktop ? "gap-2" : "gap-4";

    return (
        <div
            className="fixed left-0 right-0 flex justify-center pointer-events-none"
            style={containerStyle}
        >
            <motion.div
                className={`border-t-2 ${containerPadding} ${containerMargin} rounded-2xl flex ${gapSize} shadow-2xl pointer-events-auto relative`}
                style={{
                    backgroundColor: "rgb(var(--bg-window) / 0.7)",
                    minHeight: containerMinHeight,
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: isDesktop ? "center" : "space-around",
                    width: containerWidth,
                    maxWidth: containerMaxWidth,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {trayApps.map((app) => {
                    if (app.type === "external") {
                        return (
                            <motion.div
                                key={app.id}
                                className={`${
                                    isDesktop ? "" : "flex-1"
                                } flex justify-center gap-2`}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                }}
                            >
                                <a
                                    href={app.url}
                                    target={
                                        app.openInNewTab ? "_blank" : "_self"
                                    }
                                    rel={
                                        app.openInNewTab
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className={`${
                                        isDesktop ? "w-12 h-12" : "w-full"
                                    } ${
                                        !isDesktop
                                            ? "max-w-[140px] min-w-[100px]"
                                            : ""
                                    } rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex flex-col items-center justify-center gap-2 transition-all relative group`}
                                    title={app.title}
                                >
                                    <div
                                        className="flex-1 flex items-center justify-center w-full"
                                        style={{ minHeight: 0 }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            <IconRenderer
                                                content={app}
                                                size={iconSize}
                                                className="text-zinc-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    {!isDesktop && (
                                        <AppTrayTitle
                                            text={app.title}
                                            isExternal={true}
                                            iconSize={iconSizePx}
                                        />
                                    )}
                                    {isDesktop && (
                                        <div className="absolute bottom-full mb-2 px-2 py-1 bg-[rgb(var(--bg-dropdown))] text-[rgb(var(--text-dropdown))] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            {app.title}
                                        </div>
                                    )}
                                </a>
                            </motion.div>
                        );
                    }

                    // Only internal apps have routes
                    if (app.type !== "internal") return null;

                    const isActive = pathname === app.route;
                    return (
                        <motion.div
                            key={app.id}
                            className={`${
                                isDesktop ? "" : "flex-1"
                            } flex justify-center gap-2`}
                        >
                            <Link
                                href={app.route}
                                className={`${
                                    isDesktop
                                        ? "w-12 h-12"
                                        : "w-full min-w-[100px]"
                                } rounded-xl flex flex-col items-center justify-center gap-2 transition-all relative group ${
                                    isActive
                                        ? "bg-zinc-200 dark:bg-zinc-700"
                                        : "hover:bg-zinc-100 dark:hover:bg-zinc-700 active:bg-zinc-200 dark:active:bg-zinc-600"
                                } focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 focus-visible:ring-offset-2`}
                                title={app.title}
                                onClick={(e) => {
                                    // Blur the link after click to remove focus state
                                    setTimeout(() => {
                                        (e.currentTarget as HTMLElement).blur();
                                    }, 100);
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                    }}
                                    className="flex flex-col items-center justify-center w-full h-full flex-1 gap-2"
                                >
                                    <div
                                        className="flex-1 flex items-center justify-center w-full"
                                        style={{ minHeight: 0 }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            <IconRenderer
                                                content={app}
                                                size={iconSize}
                                                className="text-zinc-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    {!isDesktop && (
                                        <AppTrayTitle
                                            text={app.title}
                                            isActive={isActive}
                                            iconSize={iconSizePx}
                                        />
                                    )}
                                    {isDesktop && (
                                        <div className="absolute bottom-full mb-2 px-2 py-1 bg-[rgb(var(--bg-dropdown))] text-[rgb(var(--text-dropdown))] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            {app.title}
                                        </div>
                                    )}
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

interface AppTrayTitleProps {
    text: string;
    isActive?: boolean;
    isExternal?: boolean;
    iconSize: number;
}

function AppTrayTitle({
    text,
    isActive = false,
    isExternal = false,
    iconSize,
}: AppTrayTitleProps) {
    // Text container should match icon width
    const baseClasses = isActive
        ? "text-[rgb(var(--text-primary))] dark:text-[rgb(var(--text-secondary))]"
        : "text-[rgb(var(--text-secondary))] dark:text-[rgb(var(--text-primary))]";

    const hoverClasses = isExternal
        ? "group-hover:text-[rgb(var(--text-primary))] dark:group-hover:text-[rgb(var(--text-secondary))]"
        : "group-hover:text-[rgb(var(--text-secondary))] dark:group-hover:text-[rgb(var(--text-primary))]";

    return (
        <div
            className="text-xs text-center leading-tight relative"
            style={{ width: `${iconSize}px` }}
        >
            <RevolvingText
                text={text}
                containerWidth={iconSize}
                className={`transition-colors ${baseClasses} ${hoverClasses}`}
            />
        </div>
    );
}
