"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppMessages } from "@/app/hooks/useAppMessages";
import { Wallpaper } from "./Wallpaper";

interface SplashScreenProps {
    isLoading: boolean;
}

export function SplashScreen({ isLoading }: SplashScreenProps) {
    const messages = useAppMessages();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Cycle through messages every 3 seconds
    useEffect(() => {
        if (messages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [messages.length]);

    const currentMessage = messages[currentMessageIndex];

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[999999] flex items-center justify-center"
                    style={{
                        backgroundColor: "rgb(var(--bg-desktop))",
                    }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <Wallpaper />
                    <div className="relative flex flex-col items-center gap-6">
                        {/* The Ni element tile, plated in the current palette */}
                        <motion.div
                            className="nk-tile relative flex flex-col items-center justify-center w-28 h-28 font-sans font-black tracking-tight"
                            style={{ ["--tile-hue" as string]: "var(--nk-h1)" }}
                            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                        >
                            <span className="absolute top-2.5 left-3 text-xs font-mono opacity-80">
                                28
                            </span>
                            <span className="text-5xl mt-2">Ni</span>
                            <span className="text-[9px] font-mono tracking-[0.2em] opacity-80 mt-1">
                                NICKEL
                            </span>
                        </motion.div>

                        {/* Message about apps - title and description components */}
                        {currentMessage && (
                            <motion.div
                                className="nk-label flex flex-col items-center gap-2 px-4"
                                key={currentMessageIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                }}
                                style={{
                                    maxWidth: "90vw",
                                }}
                            >
                                <div
                                    className="text-base font-semibold text-center font-bbh-bartle"
                                    style={{
                                        color: "rgb(var(--text-primary))",
                                    }}
                                >
                                    {currentMessage.title}
                                </div>
                                <div
                                    className="text-sm text-center"
                                    style={{
                                        color: "rgb(var(--text-secondary))",
                                    }}
                                >
                                    {currentMessage.description}
                                </div>
                            </motion.div>
                        )}

                        {/* Loading indicator - using text-primary for better contrast */}
                        <motion.div
                            className="flex gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: 0.5,
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            "rgb(var(--text-primary))",
                                    }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
