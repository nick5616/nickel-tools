"use client";

import React from "react";
import { motion } from "framer-motion";
import { getContentById } from "@/app/data/content";
import { IconRenderer } from "@/components/shared/IconRenderer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RevolvingText } from "@/components/shared/RevolvingText";

interface AppTrayProps {
    variant?: "fixed" | "relative";
}

export function AppTray({ variant = "fixed" }: AppTrayProps = {}) {
    const pathname = usePathname();
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
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        width: "100%",
        height: "auto",
    };

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none`}
            style={containerStyle}
        >
            <motion.div
                className="border-t-2 p-2 py-4 m-2 rounded-2xl flex gap-4 shadow-2xl pointer-events-auto w-full relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    backgroundColor: "rgb(var(--bg-window) / 0.7)",
                    minHeight: "80px",
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "space-around",
                    width: "100%",
                    maxWidth: "100%",
                }}
            >
                {trayApps.map((app) => {
                    if (app.type === "external") {
                        return (
                            <motion.div
                                key={app.id}
                                className="flex-1 flex justify-center gap-2"
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
                                    className="w-full max-w-[140px] rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex flex-col items-center justify-center gap-2 transition-all relative group min-w-[100px]"
                                    title={app.title}
                                >
                                    <div
                                        className="flex-1 flex items-center justify-center w-full"
                                        style={{ minHeight: 0 }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            <IconRenderer
                                                content={app}
                                                size="lg"
                                                className="text-zinc-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    <AppTrayTitle
                                        text={app.title}
                                        isExternal={true}
                                    />
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
                            className="flex-1 flex justify-center gap-2"
                        >
                            <Link
                                href={app.route}
                                className={`w-full rounded-xl flex flex-col items-center justify-center gap-2 transition-all relative group min-w-[100px] ${
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
                                                size="lg"
                                                className="text-zinc-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    <AppTrayTitle
                                        text={app.title}
                                        isActive={isActive}
                                    />
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
}

function AppTrayTitle({
    text,
    isActive = false,
    isExternal = false,
}: AppTrayTitleProps) {
    // Icon size "lg" is 48px, so text container should match that width
    const baseClasses = isActive
        ? "text-[rgb(var(--text-primary))] dark:text-[rgb(var(--text-secondary))]"
        : "text-[rgb(var(--text-secondary))] dark:text-[rgb(var(--text-primary))]";

    const hoverClasses = isExternal
        ? "group-hover:text-[rgb(var(--text-primary))] dark:group-hover:text-[rgb(var(--text-secondary))]"
        : "group-hover:text-[rgb(var(--text-secondary))] dark:group-hover:text-[rgb(var(--text-primary))]";

    return (
        <div
            className="w-12 text-xs text-center leading-tight relative"
            style={{ width: "48px" }}
        >
            <RevolvingText
                text={text}
                containerWidth={48}
                className={`transition-colors ${baseClasses} ${hoverClasses}`}
            />
        </div>
    );
}
