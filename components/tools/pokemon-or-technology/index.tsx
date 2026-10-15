"use client";

import React, { useState, useEffect } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { paletteColor } from "@/app/utils/nickelPalette";

const DATABASE = [
    // Pokémon (50)
    { name: "Klinklang", isPokemon: true },
    { name: "Dhelmise", isPokemon: true },
    { name: "Xurkitree", isPokemon: true },
    { name: "Magnezone", isPokemon: true },
    { name: "Electrode", isPokemon: true },
    { name: "Porygon-Z", isPokemon: true },
    { name: "Type: Null", isPokemon: true },
    { name: "Metapod", isPokemon: true },
    { name: "Jolteon", isPokemon: true },
    { name: "Rotom", isPokemon: true },
    { name: "Umbreon", isPokemon: true },
    { name: "Registeel", isPokemon: true },
    { name: "Absol", isPokemon: true },
    { name: "Mimikyu", isPokemon: true },
    { name: "Geodude", isPokemon: true },
    { name: "Snorlax", isPokemon: true },
    { name: "Muk", isPokemon: true },
    { name: "Ditto", isPokemon: true },
    { name: "Onix", isPokemon: true },
    { name: "Glalie", isPokemon: true },
    { name: "Cryogonal", isPokemon: true },
    { name: "Celesteela", isPokemon: true },
    { name: "Naganadel", isPokemon: true },
    { name: "Buzzwole", isPokemon: true },
    { name: "Nihilego", isPokemon: true },
    { name: "Kartana", isPokemon: true },
    { name: "Komala", isPokemon: true },
    { name: "Minior", isPokemon: true },
    { name: "Pyukumuku", isPokemon: true },
    { name: "Togedemaru", isPokemon: true },
    { name: "Drampa", isPokemon: true },
    { name: "Turtonator", isPokemon: true },
    { name: "Vikavolt", isPokemon: true },
    { name: "Golisopod", isPokemon: true },
    { name: "Toxapex", isPokemon: true },
    { name: "Mudsdale", isPokemon: true },
    { name: "Decidueye", isPokemon: true },
    { name: "Primarina", isPokemon: true },
    { name: "Incineroar", isPokemon: true },
    { name: "Lycanroc", isPokemon: true },
    { name: "Kommo-o", isPokemon: true },
    { name: "Necrozma", isPokemon: true },
    { name: "Stakataka", isPokemon: true },
    { name: "Blacephalon", isPokemon: true },
    { name: "Zeraora", isPokemon: true },
    { name: "Meltan", isPokemon: true },
    { name: "Melmetal", isPokemon: true },
    { name: "Corviknight", isPokemon: true },
    { name: "Dracovish", isPokemon: true },
    { name: "Eternatus", isPokemon: true },

    // Technology (50)
    { name: "Monad", isPokemon: false },
    { name: "Flask", isPokemon: false },
    { name: "Overflow", isPokemon: false },
    { name: "Deadlock", isPokemon: false },
    { name: "Currying", isPokemon: false },
    { name: "Mixin", isPokemon: false },
    { name: "Queue", isPokemon: false },
    { name: "Crystal", isPokemon: false },
    { name: "Thunk", isPokemon: false },
    { name: "Swift", isPokemon: false },
    { name: "Ruby", isPokemon: false },
    { name: "Heap", isPokemon: false },
    { name: "Redux", isPokemon: false },
    { name: "Lambda", isPokemon: false },
    { name: "Singleton", isPokemon: false },
    { name: "Observer", isPokemon: false },
    { name: "Prototype", isPokemon: false },
    { name: "Iterator", isPokemon: false },
    { name: "Closure", isPokemon: false },
    { name: "Facade", isPokemon: false },
    { name: "Elixir", isPokemon: false },
    { name: "Ember", isPokemon: false },
    { name: "Phoenix", isPokemon: false },
    { name: "Tornado", isPokemon: false },
    { name: "Django", isPokemon: false },
    { name: "Pyramid", isPokemon: false },
    { name: "Meteor", isPokemon: false },
    { name: "Polymer", isPokemon: false },
    { name: "Ionic", isPokemon: false },
    { name: "Adapter", isPokemon: false },
    { name: "Mediator", isPokemon: false },
    { name: "Visitor", isPokemon: false },
    { name: "Decorator", isPokemon: false },
    { name: "Flyweight", isPokemon: false },
    { name: "Memento", isPokemon: false },
    { name: "Strategy", isPokemon: false },
    { name: "Template", isPokemon: false },
    { name: "Functor", isPokemon: false },
    { name: "Reducer", isPokemon: false },
    { name: "Middleware", isPokemon: false },
    { name: "Webpack", isPokemon: false },
    { name: "Parcel", isPokemon: false },
    { name: "Rollup", isPokemon: false },
    { name: "Vite", isPokemon: false },
    { name: "Deno", isPokemon: false },
    { name: "Bun", isPokemon: false },
    { name: "Svelte", isPokemon: false },
    { name: "Nuxt", isPokemon: false },
    { name: "Astro", isPokemon: false },
    { name: "Prisma", isPokemon: false },
];

export default function PokemonTechQuiz() {
    const [items, setItems] = useState<
        Array<{ name: string; isPokemon: boolean }>
    >([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    useEffect(() => {
        startGame();
    }, []);

    const startGame = () => {
        const shuffled = [...DATABASE]
            .sort(() => Math.random() - 0.5)
            .slice(0, 20);
        setItems(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setGameComplete(false);
    };

    const handleGuess = (guessPokemon: boolean) => {
        const current = items[currentIndex];
        const correct = current.isPokemon === guessPokemon;

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore((prevScore) => prevScore + 1);
        }

        setTimeout(() => {
            setCurrentIndex((prevIndex) => {
                if (prevIndex + 1 < items.length) {
                    setShowResult(false);
                    return prevIndex + 1;
                } else {
                    setGameComplete(true);
                    return prevIndex;
                }
            });
        }, 1200);
    };

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-[rgb(var(--text-secondary))]">
                    Loading…
                </div>
            </div>
        );
    }

    if (gameComplete) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <div className="nk-group !p-8 max-w-md w-full text-center">
                    <h2 className="nk-section-title mb-3">Game complete</h2>
                    <p className="text-6xl font-black tabular-nums mb-2" style={{ color: paletteColor(1, "fg") }}>
                        {score}/{items.length}
                    </p>
                    <p className="text-lg text-[rgb(var(--text-secondary))] mb-6">
                        {score === items.length
                            ? "Perfect score! 🎉"
                            : score >= items.length * 0.8
                            ? "Great job! 🌟"
                            : score >= items.length * 0.6
                            ? "Not bad! 👍"
                            : "Keep practicing! 💪"}
                    </p>
                    <button
                        onClick={startGame}
                        className="nk-btn nk-btn-primary nk-btn-lg mx-auto"
                    >
                        <RotateCcw size={18} />
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const current = items[currentIndex];
    return (
        <div className="flex items-center justify-center h-full p-4">
            <div className="nk-group !p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="nk-section-title">
                        Question {currentIndex + 1} of {items.length}
                    </div>
                    <div className="nk-badge tabular-nums">Score {score}</div>
                </div>
                <div className="mb-8 text-center relative">
                    <h1 className="text-4xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        {current.name}
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Is this a Pokémon or Technology?
                    </p>

                    {showResult && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[rgb(var(--bg-window)/0.92)] backdrop-blur-sm">
                            {isCorrect ? (
                                <div className="text-center">
                                    <Check
                                        size={64}
                                        className="text-green-500 mx-auto mb-2"
                                        strokeWidth={3}
                                    />
                                    <p className="text-2xl font-bold text-green-600">
                                        Correct!
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <X
                                        size={64}
                                        className="text-red-500 mx-auto mb-1"
                                        strokeWidth={3}
                                    />
                                    <p className="text-2xl font-bold text-red-600">
                                        Wrong!
                                    </p>
                                    <p className="text-[rgb(var(--text-secondary))] mt-1">
                                        It's a{" "}
                                        {current.isPokemon
                                            ? "Pokémon"
                                            : "Technology"}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleGuess(true)}
                        disabled={showResult}
                        className="nk-btn nk-btn-lg !h-14"
                        style={{ background: paletteColor(1, "fg"), color: paletteColor(1, "bg") }}
                    >
                        Pokémon
                    </button>
                    <button
                        onClick={() => handleGuess(false)}
                        disabled={showResult}
                        className="nk-btn nk-btn-lg !h-14"
                        style={{ background: paletteColor(2, "fg"), color: paletteColor(2, "bg") }}
                    >
                        Technology
                    </button>
                </div>
                <div className="mt-6">
                    <div className="nk-progress">
                        <div
                            style={{
                                width: `${
                                    ((currentIndex + 1) / items.length) * 100
                                }%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
