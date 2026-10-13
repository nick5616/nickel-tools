"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Content } from "@/app/data/content";
import { AppTile } from "@/components/shared/AppTile";
import { paletteColor, getCategorySlot } from "@/app/utils/nickelPalette";
import { springs } from "@/components/shared/motion";

interface AppSwitcherProps {
    recents: Content[];
    onOpen: (content: Content) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
}

/** Recent apps as cards. Swipe a card up to clear it; tap the background to go home. */
export function AppSwitcher({ recents, onOpen, onRemove, onClose }: AppSwitcherProps) {
    return (
        <motion.div
            className="fixed inset-0 z-[13000] bg-black/30 backdrop-blur-xl flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            {recents.length === 0 ? (
                <p className="text-center text-white/80 text-sm">No recent apps</p>
            ) : (
                <div
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-[12vw] py-8 [scrollbar-width:none]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AnimatePresence initial={false}>
                        {recents.map((content, i) => {
                            const slot = getCategorySlot(content.category);
                            return (
                                <motion.div
                                    key={content.id}
                                    className="snap-center shrink-0 w-[76vw] max-w-[340px]"
                                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -300, transition: { duration: 0.25 } }}
                                    transition={{ ...springs.window, delay: i * 0.03 }}
                                    drag="y"
                                    dragConstraints={{ top: 0, bottom: 0 }}
                                    dragElastic={{ top: 0.9, bottom: 0.1 }}
                                    onDragEnd={(_e, info) => {
                                        if (info.offset.y < -110 || info.velocity.y < -700) {
                                            onRemove(content.id);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2 px-1 text-white">
                                        <AppTile content={content} size={24} showNumber={false} />
                                        <span className="text-sm font-semibold truncate">{content.title}</span>
                                    </div>
                                    <button
                                        onClick={() => onOpen(content)}
                                        className="w-full h-[58vh] rounded-[32px] overflow-hidden flex flex-col items-center justify-center gap-5 p-6 text-left shadow-2xl"
                                        style={{ background: paletteColor(slot, "bg") }}
                                    >
                                        <AppTile content={content} size={96} />
                                        <p
                                            className="text-sm leading-relaxed line-clamp-6"
                                            style={{ color: paletteColor(slot, "fg") }}
                                        >
                                            {content.description}
                                        </p>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
