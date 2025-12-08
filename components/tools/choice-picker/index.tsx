"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, X, Play } from "lucide-react";

export default function ChoicePicker() {
    const [stage, setStage] = useState<"input" | "spinner">("input");
    const [options, setOptions] = useState<string[]>([""]);
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
                console.log("No saved data found");
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
            <div className="h-full flex items-center justify-center p-8 my-8">
                <div className="w-full max-w-2xl">
                    <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-8">
                            <h1 className="text-4xl font-bold text-white">
                                Decision Spinner
                            </h1>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-white/90">
                                    Context Info (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={contextLabel}
                                    onChange={(e) =>
                                        setContextLabel(e.target.value)
                                    }
                                    placeholder='e.g., "Bank Account Balance"'
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 transition"
                                />
                                <input
                                    type="text"
                                    value={contextInfo}
                                    onChange={(e) =>
                                        setContextInfo(e.target.value)
                                    }
                                    placeholder='e.g., "$50,000"'
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 transition"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-white/90">
                                    Your Options
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
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 transition"
                                        />
                                        {options.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    removeOption(index)
                                                }
                                                className="px-3 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-red-200 transition"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addOption}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Option
                            </button>

                            <button
                                onClick={startExperience}
                                disabled={
                                    options.filter((opt) => opt.trim() !== "")
                                        .length < 2
                                }
                                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-300 hover:to-pink-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                Let&apos;s Spin! ✨
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const colors = [
        "from-red-500 to-red-600",
        "from-blue-500 to-blue-600",
        "from-green-500 to-green-600",
        "from-yellow-500 to-yellow-600",
        "from-purple-500 to-purple-600",
        "from-pink-500 to-pink-600",
        "from-indigo-500 to-indigo-600",
        "from-teal-500 to-teal-600",
    ];

    // Create a very long repeating list to ensure we never run out
    const repeats = 50;
    const allItems = Array.from({ length: repeats }, () => options).flat();

    // Calculate blur based on velocity
    const maxBlur = 8;
    const blurAmount = Math.min((velocity / 50) * maxBlur, maxBlur);

    return (
        <div className="h-full flex flex-col p-8">
            {/* Context Info at Top */}
            <div className="w-full flex justify-center mb-8">
                {contextLabel && contextInfo && (
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl px-8 py-4 border border-white/20">
                        <p className="text-white/70 text-sm text-center">
                            {contextLabel}
                        </p>
                        <p className="text-white text-3xl font-bold text-center">
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
                        className="absolute rounded-full bg-yellow-300 pointer-events-none z-50"
                        style={{
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
                    className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent z-30 pointer-events-none"
                    style={{
                        boxShadow:
                            "0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4)",
                        filter: "drop-shadow(0 0 10px rgba(250, 204, 21, 1))",
                    }}
                />

                {/* Top arrow for pointer */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400"
                        style={{
                            filter: "drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))",
                        }}
                    />
                </div>

                {/* Bottom arrow for pointer */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-30 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-yellow-400"
                        style={{
                            filter: "drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))",
                        }}
                    />
                </div>

                {/* Spinner Track */}
                <div className="relative w-full h-64">
                    {/* Top and bottom fade */}
                    <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-indigo-900 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-indigo-900 to-transparent z-20 pointer-events-none" />

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
                                className={`flex-shrink-0 w-64 h-48 rounded-2xl bg-gradient-to-br ${
                                    colors[index % colors.length]
                                } shadow-2xl border-4 border-white/30 flex items-center justify-center p-6`}
                            >
                                <p className="text-white text-2xl font-bold text-center break-words">
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
                        className="backdrop-blur-xl bg-white/10 rounded-2xl px-12 py-6 border border-white/20 text-center"
                        style={{
                            animation: "bounce 0.5s ease-out 2",
                        }}
                    >
                        <p className="text-white/70 text-lg mb-2">
                            Your Decision:
                        </p>
                        <p className="text-white text-4xl font-bold">
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
                    className="px-12 py-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-white font-bold text-2xl shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed border-4 border-white/30 flex items-center gap-4"
                    style={{
                        boxShadow: spinning
                            ? "0 0 60px rgba(250, 204, 21, 0.8)"
                            : "0 10px 30px rgba(0,0,0,0.4)",
                    }}
                >
                    {spinning ? (
                        <>
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Spinning...</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-8 h-8" />
                            <span>SPIN!</span>
                        </>
                    )}
                </button>

                <button
                    onClick={reset}
                    className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition font-medium"
                >
                    Start Over
                </button>
            </div>
        </div>
    );
}

