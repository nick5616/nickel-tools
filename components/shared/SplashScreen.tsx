"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevolvingText } from "./RevolvingText";
import { useAppMessages } from "@/app/hooks/useAppMessages";

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

    const currentMessage = messages[currentMessageIndex] || "";

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
                    <div className="flex flex-col items-center gap-6">
                        {/* [Ni] Nickel Logo - matching MenuBar style */}
                        <motion.div
                            className="relative flex items-center gap-2"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 0.1,
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold"
                                style={{
                                    backgroundColor: "rgb(var(--bg-window))",
                                    color: "rgb(var(--text-primary))",
                                }}
                            >
                                Ni
                            </div>
                            <span
                                className="font-bold text-lg"
                                style={{
                                    color: "rgb(var(--text-primary))",
                                }}
                            >
                                Nickel
                            </span>
                        </motion.div>

                        {/* Revolving message about apps */}
                        {currentMessage && (
                            <motion.div
                                className="flex flex-col items-center gap-3"
                                key={currentMessageIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                }}
                            >
                                <div
                                    className="text-sm text-center"
                                    style={{
                                        color: "rgb(var(--text-secondary))",
                                        width: "400px",
                                        maxWidth: "90vw",
                                    }}
                                >
                                    <RevolvingText
                                        text={currentMessage}
                                        containerWidth={400}
                                        className="text-[rgb(var(--text-secondary))]"
                                    />
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

