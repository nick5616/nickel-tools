"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export interface MenuItem {
    label?: string;
    onClick?: () => void;
    checked?: boolean;
    radio?: boolean;
    separator?: boolean;
    icon?: React.ReactNode;
}

interface MenuDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
    position?: { top?: number; left?: number; right?: number };
    align?: "left" | "right";
}

export function MenuDropdown({
    isOpen,
    onClose,
    items,
    position,
    align = "left",
}: MenuDropdownProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) {
            setFocusedIndex(-1);
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            const nonSeparatorItems = items.filter((item) => !item.separator);
            const currentIndex =
                focusedIndex >= 0
                    ? nonSeparatorItems.findIndex((_, idx) => {
                          let count = 0;
                          for (let i = 0; i < items.length; i++) {
                              if (items[i].separator) continue;
                              if (count === focusedIndex) return i === count;
                              count++;
                          }
                          return false;
                      })
                    : -1;

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    const nextIndex =
                        currentIndex < nonSeparatorItems.length - 1
                            ? currentIndex + 1
                            : 0;
                    setFocusedIndex(nextIndex);
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    const prevIndex =
                        currentIndex > 0
                            ? currentIndex - 1
                            : nonSeparatorItems.length - 1;
                    setFocusedIndex(prevIndex);
                    break;
                case "Enter":
                    if (
                        currentIndex >= 0 &&
                        currentIndex < nonSeparatorItems.length
                    ) {
                        event.preventDefault();
                        nonSeparatorItems[currentIndex]?.onClick?.();
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, items, focusedIndex]);

    if (!isOpen) return null;

    const style: React.CSSProperties = {
        position: "fixed",
        top: position?.top ?? 0,
        ...(align === "right"
            ? { right: position?.right ?? 0 }
            : { left: position?.left ?? 0 }),
    };

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="z-[100] mt-1 bg-zinc-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-zinc-700 min-w-[180px] py-1"
                style={style}
            >
                {items.map((item, index) => {
                    if (item.separator) {
                        return (
                            <div
                                key={`separator-${index}`}
                                className="h-px bg-zinc-700 my-1 mx-2"
                            />
                        );
                    }

                    const itemIndex = items
                        .slice(0, index)
                        .filter((i) => !i.separator).length;
                    const isFocused = focusedIndex === itemIndex;

                    return (
                        <button
                            key={`item-${index}`}
                            onClick={() => {
                                item?.onClick?.();
                                onClose();
                            }}
                            onMouseEnter={() => setFocusedIndex(itemIndex)}
                            className={`
                w-full text-left px-4 py-2 text-xs text-zinc-300 
                flex items-center justify-between gap-4
                transition-colors
                ${isFocused ? "bg-zinc-800" : "hover:bg-zinc-800"}
              `}
                        >
                            <div className="flex items-center gap-2">
                                {item.icon && (
                                    <span className="text-zinc-400">
                                        {item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                            </div>
                            {(item.checked || item.radio) && (
                                <span className="text-zinc-400 text-xs">
                                    {item.checked && <Check size={14} />}
                                    {item.radio && (
                                        <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                    )}
                                </span>
                            )}
                        </button>
                    );
                })}
            </motion.div>
        </AnimatePresence>
    );
}
