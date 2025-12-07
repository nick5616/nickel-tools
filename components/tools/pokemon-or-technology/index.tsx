"use client";

import React, { useState, useEffect } from "react";
import { Check, X, RotateCcw } from "lucide-react";

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
            <div className="flex items-center justify-center h-full bg-[rgb(var(--bg-window))]">
                <div className="text-[rgb(var(--text-primary))] text-xl">
                    Loading...
                </div>
            </div>
        );
    }

    if (gameComplete) {
        return (
            <div className="flex items-center justify-center h-full bg-[rgb(var(--bg-window))] p-4">
                <div className="bg-[rgb(var(--bg-button))] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-[rgb(var(--border-window))]">
                    <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-4">
                        Game Complete!
                    </h2>
                    <p className="text-6xl font-bold text-[rgb(var(--accent-nickel))] mb-2">
                        {score}/{items.length}
                    </p>
                    <p className="text-xl text-[rgb(var(--text-secondary))] mb-6">
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
                        className="bg-[rgb(var(--accent-nickel))] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        <RotateCcw size={20} />
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const current = items[currentIndex];
    return (
        <div className="flex items-center justify-center h-full bg-[rgb(var(--bg-window))] p-4">
            <div className="bg-[rgb(var(--bg-button))] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[rgb(var(--border-window))]">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm font-semibold text-[rgb(var(--text-secondary))]">
                        Question {currentIndex + 1}/{items.length}
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--accent-nickel))]">
                        Score: {score}
                    </div>
                </div>
                <div className="mb-8 text-center relative">
                    <h1 className="text-4xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        {current.name}
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Is this a Pokémon or Technology?
                    </p>

                    {showResult && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[rgb(var(--bg-button))] bg-opacity-95">
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
                        className="bg-[rgb(var(--accent-nickel))] hover:opacity-90 disabled:bg-[rgb(var(--border-window))] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed"
                    >
                        Pokémon
                    </button>
                    <button
                        onClick={() => handleGuess(false)}
                        disabled={showResult}
                        className="bg-[rgb(var(--accent-nickel))] hover:opacity-90 disabled:bg-[rgb(var(--border-window))] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed"
                    >
                        Technology
                    </button>
                </div>
                <div className="mt-6">
                    <div className="w-full bg-[rgb(var(--border-window))] rounded-full h-2">
                        <div
                            className="bg-[rgb(var(--accent-nickel))] h-2 rounded-full transition-all duration-300"
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
