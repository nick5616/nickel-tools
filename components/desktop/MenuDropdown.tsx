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
    triggerRef?: React.RefObject<HTMLElement | null>;
}

export function MenuDropdown({
    isOpen,
    onClose,
    items,
    position,
    align = "left",
    triggerRef,
}: MenuDropdownProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking inside the menu
            if (menuRef.current?.contains(target)) {
                return;
            }
            // Don't close if clicking the trigger button
            if (triggerRef?.current?.contains(target)) {
                return;
            }
            // Close if clicking outside both menu and trigger
            onClose();
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
    }, [isOpen, onClose, triggerRef]);

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
                initial={{ opacity: 0, scale: 0.97, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -4 }}
                transition={{ type: "spring", stiffness: 520, damping: 36 }}
                className="nk-material-thick z-[10001] mt-1 rounded-xl min-w-[200px] p-1 origin-top-left"
                style={style}
            >
                {items.map((item, index) => {
                    if (item.separator) {
                        return (
                            <div
                                key={`separator-${index}`}
                                className="h-px bg-[rgb(var(--text-primary)/0.12)] my-1 mx-2"
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
                w-full text-left px-3 py-1.5 rounded-md text-[13px] text-[rgb(var(--text-primary))]
                flex items-center justify-between gap-4
                ${
                    isFocused
                        ? "bg-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-fg-l))] text-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-bg-l))]"
                        : ""
                }
              `}
                        >
                            <div className="flex items-center gap-2">
                                {item.icon && (
                                    <span className="opacity-70">
                                        {item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                            </div>
                            {item.checked && (
                                <span className="opacity-80 flex items-center">
                                    {item.radio ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    ) : (
                                        <Check size={14} />
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
