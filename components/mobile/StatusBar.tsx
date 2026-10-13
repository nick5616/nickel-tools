"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Battery, BatteryCharging, Wifi, WifiOff } from "lucide-react";
import { springs } from "@/components/shared/motion";

interface BatteryInfo {
    level: number;
    charging: boolean;
}

interface StatusBarProps {
    // Shown briefly in the island, e.g. the app that just opened
    activity?: string | null;
}

export function StatusBar({ activity }: StatusBarProps) {
    const [time, setTime] = useState<string | null>(null);
    const [battery, setBattery] = useState<BatteryInfo | null>(null);
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                }).replace(/\s?[AP]M/, "")
            );
        tick();
        const id = setInterval(tick, 10_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        type BatteryManager = EventTarget & { level: number; charging: boolean };
        if ("getBattery" in navigator) {
            (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
                .getBattery()
                .then((b) => {
                    const update = () =>
                        setBattery({ level: Math.round(b.level * 100), charging: b.charging });
                    update();
                    b.addEventListener("chargingchange", update);
                    b.addEventListener("levelchange", update);
                    cleanup = () => {
                        b.removeEventListener("chargingchange", update);
                        b.removeEventListener("levelchange", update);
                    };
                })
                .catch(() => setBattery(null));
        }
        return () => cleanup?.();
    }, []);

    useEffect(() => {
        setOnline(navigator.onLine);
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => {
            window.removeEventListener("online", on);
            window.removeEventListener("offline", off);
        };
    }, []);

    const BatteryIcon = battery?.charging ? BatteryCharging : Battery;

    return (
        <div
            className="relative flex items-center justify-between px-7 text-[15px] font-semibold text-[rgb(var(--text-primary))]"
            style={{
                paddingTop: "max(env(safe-area-inset-top, 0px), 10px)",
                height: "calc(max(env(safe-area-inset-top, 0px), 10px) + 34px)",
            }}
        >
            <span className="nk-label tabular-nums w-16">{time}</span>

            {/* The Ni island */}
            <div
                className="absolute inset-x-0 flex justify-center pointer-events-none"
                style={{ top: "max(env(safe-area-inset-top, 0px), 8px)" }}
            >
            <motion.div
                layout
                className="h-[30px] rounded-full bg-black text-white flex items-center gap-2 px-3 overflow-hidden"
                transition={springs.snappy}
            >
                <span
                    className="nk-tile w-[20px] h-[20px] flex items-center justify-center text-[9px] font-sans font-black tracking-tight"
                    style={{ ["--tile-hue" as string]: "var(--nk-h1)" }}
                >
                    Ni
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                    {activity ? (
                        <motion.span
                            key={activity}
                            className="text-xs font-medium whitespace-nowrap max-w-[46vw] truncate"
                            initial={{ opacity: 0, filter: "blur(4px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(4px)" }}
                        >
                            {activity}
                        </motion.span>
                    ) : (
                        <motion.span
                            key="idle"
                            className="text-[10px] font-mono text-white/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            28
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
            </div>

            <span className="nk-label flex items-center gap-1.5 w-16 justify-end">
                {online ? <Wifi size={16} strokeWidth={2.5} /> : <WifiOff size={16} strokeWidth={2.5} />}
                {battery && <BatteryIcon size={22} strokeWidth={1.75} />}
            </span>
        </div>
    );
}
