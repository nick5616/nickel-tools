"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Play, RotateCcw } from "lucide-react";
import { paletteColor } from "@/app/utils/nickelPalette";

export default function ChoicePicker() {
    const [stage, setStage] = useState<"input" | "spinner">("input");
    const [options, setOptions] = useState<string[]>(["", "", ""]);
    const [contextInfo, setContextInfo] = useState("");
    const [contextLabel, setContextLabel] = useState("");
    const [spinning, setSpinning] = useState(false);
    const [offset, setOffset] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [particles, setParticles] = useState<
        Array<{ id: number; angle: number; speed: number; size: number }>
    >([]);
    const [velocity, setVelocity] = useState(0);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const loadData = () => {
            try {
                const savedData = localStorage.getItem("decision-wheel-data");
                if (savedData) {
                    const data = JSON.parse(savedData);
                    setOptions(data.options || [""]);
                    setContextInfo(data.contextInfo || "");
                    setContextLabel(data.contextLabel || "");
                }
            } catch (error) {
                // Nothing saved yet
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const saveData = () => {
            try {
                localStorage.setItem(
                    "decision-wheel-data",
                    JSON.stringify({
                        options,
                        contextInfo,
                        contextLabel,
                    })
                );
            } catch (error) {
                console.error("Error saving data:", error);
            }
        };
        saveData();
    }, [options, contextInfo, contextLabel]);

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const startExperience = () => {
        const validOptions = options.filter((opt) => opt.trim() !== "");
        if (validOptions.length < 2) return;
        setOptions(validOptions);
        setSelectedIndex(null);
        setOffset(0);
        setSpinning(false);
        setVelocity(0);
        setStage("spinner");
    };

    const spinReel = () => {
        if (spinning) return;

        setSpinning(true);
        setSelectedIndex(null);
        setParticles([]);

        const winner = Math.floor(Math.random() * options.length);
        const itemWidth = 280; // 264px card + 16px gap

        // Start with first item centered on screen
        setOffset(0);

        // Add full cycles to make it exciting
        const cycles = 8;
        const winnerPositionInList = cycles * options.length + winner;

        // Move left so the winner item's center aligns with screen center
        // Each item needs to move itemWidth to shift by one position
        const finalOffset = -(winnerPositionInList * itemWidth);

        // Use custom animation with velocity tracking
        const duration = 4000;
        const startTime = Date.now();
        const startOffset = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const eased =
                progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentOffset =
                startOffset + (finalOffset - startOffset) * eased;
            setOffset(currentOffset);

            // Calculate velocity (pixels per frame)
            const instantVelocity =
                (Math.abs(finalOffset - startOffset) * (1 - eased) * 16) /
                duration;
            setVelocity(instantVelocity);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setVelocity(0);
                setSelectedIndex(winner);
                createParticles();
                setTimeout(() => {
                    setSpinning(false);
                }, 1000);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const createParticles = () => {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            angle: (Math.PI * 2 * i) / 50,
            speed: 2 + Math.random() * 3,
            size: 4 + Math.random() * 8,
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    const reset = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setStage("input");
        setOffset(0);
        setSelectedIndex(null);
        setSpinning(false);
        setVelocity(0);
    };

    if (stage === "input") {
        return (
            <div className="w-full flex items-start justify-center p-4 md:p-8">
                <div className="w-full max-w-xl">
                    <div>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">
                                Decision Spinner
                            </h1>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                List your options and let the reel decide.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="nk-section-title block">
                                    Question (optional)
                                </label>
                                <input
                                    type="text"
                                    value={contextLabel}
                                    onChange={(e) =>
                                        setContextLabel(e.target.value)
                                    }
                                    placeholder='e.g., "How much of $1000 should I invest?"'
                                    className="nk-field w-full !h-10"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="nk-section-title block">
                                    Options
                                </label>
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) =>
                                                updateOption(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`$${index * 500}`}
                                            className="nk-field flex-1 !h-10"
                                        />
                                        {options.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    removeOption(index)
                                                }
                                                className="nk-btn nk-btn-icon nk-btn-danger !h-10 !w-10"
                                                aria-label={`Remove option ${index + 1}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addOption}
                                className="nk-btn w-full !h-10"
                            >
                                <Plus className="w-4 h-4" />
                                Add Option
                            </button>

                            <button
                                onClick={startExperience}
                                disabled={
                                    options.filter((opt) => opt.trim() !== "")
                                        .length < 2
                                }
                                className="nk-btn nk-btn-primary nk-btn-lg w-full"
                            >
                                <Play className="w-4 h-4" />
                                Let&apos;s Spin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reel cards cycle through the scheme's four hue slots
    const slots = [1, 2, 3, 4];

    // Create a very long repeating list to ensure we never run out
    const repeats = 50;
    const allItems = Array.from({ length: repeats }, () => options).flat();

    // Calculate blur based on velocity
    const maxBlur = 8;
    const blurAmount = Math.min((velocity / 50) * maxBlur, maxBlur);

    return (
        <div className="w-full min-h-full flex flex-col p-4 md:p-8">
            {/* Context Info at Top */}
            <div className="w-full flex justify-center mb-8">
                {contextLabel && contextInfo && (
                    <div className="nk-group px-8 py-4">
                        <p className="text-[rgb(var(--text-secondary))] text-sm text-center">
                            {contextLabel}
                        </p>
                        <p className="text-3xl font-bold text-center">
                            {contextInfo}
                        </p>
                    </div>
                )}
            </div>

            {/* Main Spinner Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Particles */}
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full pointer-events-none z-50"
                        style={{
                            background: paletteColor((p.id % 4) + 1, "fg"),
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%)`,
                            animation: `particle-${p.id} 2s ease-out forwards`,
                        }}
                    />
                ))}
                <style>
                    {particles
                        .map(
                            (p) => `
          @keyframes particle-${p.id} {
            to {
              transform: translate(calc(-50% + ${
                  Math.cos(p.angle) * p.speed * 100
              }px), calc(-50% + ${Math.sin(p.angle) * p.speed * 100}px));
              opacity: 0;
            }
          }
        `
                        )
                        .join("")}
                </style>

                {/* Pointer - Fixed at center of screen */}
                <div
                    className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full z-30 pointer-events-none"
                    style={{
                        background: "rgb(var(--text-primary))",
                        boxShadow: "0 0 0 3px rgb(var(--bg-window))",
                    }}
                />

                {/* Top arrow for pointer */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[rgb(var(--text-primary))]"
                    />
                </div>

                {/* Bottom arrow for pointer */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-30 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[22px] border-b-[rgb(var(--text-primary))]"
                    />
                </div>

                {/* Spinner Track */}
                <div className="relative w-full h-64">
                    {/* Top and bottom fade */}
                    <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-[rgb(var(--bg-window))] to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-[rgb(var(--bg-window))] to-transparent z-20 pointer-events-none" />

                    {/* Items container - centered on screen */}
                    <div
                        className="absolute top-0 h-full flex items-center gap-4"
                        style={{
                            left: "50%",
                            transform: `translateX(calc(-50% + ${offset}px))`,
                            filter: `blur(${blurAmount}px)`,
                            willChange: "transform",
                        }}
                    >
                        {allItems.map((option, index) => (
                            <div
                                key={index}
                                className="nk-tile flex-shrink-0 w-64 h-48 !rounded-3xl flex items-center justify-center p-6"
                                style={{
                                    ["--tile-hue" as string]: `var(--nk-h${slots[index % slots.length]})`,
                                }}
                            >
                                <p className="relative z-[3] text-2xl font-bold text-center break-words">
                                    {option}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full flex flex-col items-center gap-6 mt-8">
                {selectedIndex !== null && (
                    <div
                        className="nk-group px-12 py-6 text-center"
                        style={{
                            animation: "bounce 0.5s ease-out 2",
                        }}
                    >
                        <p className="nk-section-title mb-2">
                            The reel says
                        </p>
                        <p className="text-4xl font-bold">
                            {options[selectedIndex]}
                        </p>
                    </div>
                )}
                <style>
                    {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}
                </style>

                <button
                    onClick={spinReel}
                    disabled={spinning}
                    className="nk-btn nk-btn-primary nk-btn-lg !h-14 !px-10 !text-lg"
                >
                    {spinning ? (
                        <>
                            <div className="w-5 h-5 border-[3px] border-current border-t-transparent rounded-full animate-spin" />
                            <span>Spinning…</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            <span>Spin</span>
                        </>
                    )}
                </button>

                <button
                    onClick={reset}
                    className="nk-btn"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                </button>
            </div>
        </div>
    );
}
