"use client";

import React, { useState, useEffect } from "react";
import posthog from "posthog-js";
import {
    ChevronLeft,
    ChevronRight,
    Music,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
} from "lucide-react";

export default function SmartPiano() {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [octave, setOctave] = useState(4);
    const [selectedKey, setSelectedKey] = useState("C");
    const [showSmart, setShowSmart] = useState(true);
    const [recentNotes, setRecentNotes] = useState<
        Array<{ name: string; octave: number; semitone: number }>
    >([]);
    const [noteHistory, setNoteHistory] = useState<string[]>([]);
    const [numOctaves, setNumOctaves] = useState(2);
    const [toast, setToast] = useState<{
        name: string;
        emoji: string;
        color: string;
    } | null>(null);
    const [tension, setTension] = useState(0);
    const [showResolutionEffect, setShowResolutionEffect] = useState(false);

    useEffect(() => {
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();

        const unlock = () => {
            if (ctx.state === "suspended") ctx.resume();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            g.gain.value = 0;
            o.connect(g);
            g.connect(ctx.destination);
            o.start(0);
            o.stop(0.001);
        };

        document.addEventListener("touchstart", unlock, { once: true });
        document.addEventListener("click", unlock, { once: true });

        setAudioContext(ctx);
        return () => {
            ctx.close().catch(() => {
                // Ignore errors during cleanup
            });
        };
    }, []);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w >= 1400) setNumOctaves(3);
            else if (w >= 900) setNumOctaves(2);
            else setNumOctaves(1);
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const baseFreqs = [
        { note: "C", altName: "C", freq: 261.63, isBlack: false, semitone: 0 },
        {
            note: "C#",
            altName: "Db",
            freq: 277.18,
            isBlack: true,
            semitone: 1,
        },
        { note: "D", altName: "D", freq: 293.66, isBlack: false, semitone: 2 },
        {
            note: "D#",
            altName: "Eb",
            freq: 311.13,
            isBlack: true,
            semitone: 3,
        },
        { note: "E", altName: "E", freq: 329.63, isBlack: false, semitone: 4 },
        { note: "F", altName: "F", freq: 349.23, isBlack: false, semitone: 5 },
        {
            note: "F#",
            altName: "Gb",
            freq: 369.99,
            isBlack: true,
            semitone: 6,
        },
        { note: "G", altName: "G", freq: 392.0, isBlack: false, semitone: 7 },
        {
            note: "G#",
            altName: "Ab",
            freq: 415.3,
            isBlack: true,
            semitone: 8,
        },
        { note: "A", altName: "A", freq: 440.0, isBlack: false, semitone: 9 },
        {
            note: "A#",
            altName: "Bb",
            freq: 466.16,
            isBlack: true,
            semitone: 10,
        },
        { note: "B", altName: "B", freq: 493.88, isBlack: false, semitone: 11 },
    ];

    const keyData: {
        [key: string]: {
            scale: number[];
            chords: Array<{
                name: string;
                root: string;
                type: string;
                notes: string[];
            }>;
        };
    } = {
        C: {
            scale: [0, 2, 4, 5, 7, 9, 11],
            chords: [
                { name: "C", root: "C", type: "major", notes: ["C", "E", "G"] },
                {
                    name: "Dm",
                    root: "D",
                    type: "minor",
                    notes: ["D", "F", "A"],
                },
                {
                    name: "Em",
                    root: "E",
                    type: "minor",
                    notes: ["E", "G", "B"],
                },
                { name: "F", root: "F", type: "major", notes: ["F", "A", "C"] },
                { name: "G", root: "G", type: "major", notes: ["G", "B", "D"] },
                {
                    name: "Am",
                    root: "A",
                    type: "minor",
                    notes: ["A", "C", "E"],
                },
            ],
        },
        Am: {
            scale: [9, 11, 0, 2, 4, 5, 7],
            chords: [
                {
                    name: "Am",
                    root: "A",
                    type: "minor",
                    notes: ["A", "C", "E"],
                },
                { name: "C", root: "C", type: "major", notes: ["C", "E", "G"] },
                {
                    name: "Dm",
                    root: "D",
                    type: "minor",
                    notes: ["D", "F", "A"],
                },
                {
                    name: "E",
                    root: "E",
                    type: "major",
                    notes: ["E", "G#", "B"],
                },
                { name: "F", root: "F", type: "major", notes: ["F", "A", "C"] },
            ],
        },
        G: {
            scale: [7, 9, 11, 0, 2, 4, 6],
            chords: [
                { name: "G", root: "G", type: "major", notes: ["G", "B", "D"] },
                {
                    name: "Am",
                    root: "A",
                    type: "minor",
                    notes: ["A", "C", "E"],
                },
                {
                    name: "Bm",
                    root: "B",
                    type: "minor",
                    notes: ["B", "D", "F#"],
                },
                { name: "C", root: "C", type: "major", notes: ["C", "E", "G"] },
                {
                    name: "D",
                    root: "D",
                    type: "major",
                    notes: ["D", "F#", "A"],
                },
                {
                    name: "Em",
                    root: "E",
                    type: "minor",
                    notes: ["E", "G", "B"],
                },
            ],
        },
        Em: {
            scale: [4, 6, 7, 9, 11, 0, 2],
            chords: [
                {
                    name: "Em",
                    root: "E",
                    type: "minor",
                    notes: ["E", "G", "B"],
                },
                { name: "G", root: "G", type: "major", notes: ["G", "B", "D"] },
                {
                    name: "Am",
                    root: "A",
                    type: "minor",
                    notes: ["A", "C", "E"],
                },
                {
                    name: "B",
                    root: "B",
                    type: "major",
                    notes: ["B", "D#", "F#"],
                },
                { name: "C", root: "C", type: "major", notes: ["C", "E", "G"] },
            ],
        },
        D: {
            scale: [2, 4, 6, 7, 9, 11, 1],
            chords: [
                {
                    name: "D",
                    root: "D",
                    type: "major",
                    notes: ["D", "F#", "A"],
                },
                {
                    name: "Em",
                    root: "E",
                    type: "minor",
                    notes: ["E", "G", "B"],
                },
                {
                    name: "F#m",
                    root: "F#",
                    type: "minor",
                    notes: ["F#", "A", "C#"],
                },
                { name: "G", root: "G", type: "major", notes: ["G", "B", "D"] },
                {
                    name: "A",
                    root: "A",
                    type: "major",
                    notes: ["A", "C#", "E"],
                },
                {
                    name: "Bm",
                    root: "B",
                    type: "minor",
                    notes: ["B", "D", "F#"],
                },
            ],
        },
        F: {
            scale: [5, 7, 9, 10, 0, 2, 4],
            chords: [
                { name: "F", root: "F", type: "major", notes: ["F", "A", "C"] },
                {
                    name: "Gm",
                    root: "G",
                    type: "minor",
                    notes: ["G", "A#", "D"],
                },
                {
                    name: "Am",
                    root: "A",
                    type: "minor",
                    notes: ["A", "C", "E"],
                },
                {
                    name: "Bb",
                    root: "A#",
                    type: "major",
                    notes: ["A#", "D", "F"],
                },
                { name: "C", root: "C", type: "major", notes: ["C", "E", "G"] },
                {
                    name: "Dm",
                    root: "D",
                    type: "minor",
                    notes: ["D", "F", "A"],
                },
            ],
        },
    };

    const keyNoteNames: {
        [key: string]: { [semitone: number]: string };
    } = {
        C: { 1: "C#", 3: "D#", 6: "F#", 8: "G#", 10: "A#" },
        G: { 1: "C#", 3: "D#", 6: "F#", 8: "G#", 10: "A#" },
        D: { 1: "C#", 3: "D#", 6: "F#", 8: "G#", 10: "A#" },
        F: { 1: "Db", 3: "Eb", 6: "Gb", 8: "Ab", 10: "Bb" },
        Am: { 1: "C#", 3: "Eb", 6: "F#", 8: "G#", 10: "Bb" },
        Em: { 1: "C#", 3: "D#", 6: "F#", 8: "G#", 10: "Bb" },
    };

    const getNoteName = (semitone: number) => {
        const note = baseFreqs.find((n) => n.semitone === semitone);
        if (!note || !note.isBlack) return note?.note;
        return keyNoteNames[selectedKey]?.[semitone] || note.note;
    };

    const getFreq = (base: number, baseOct: number, targetOct: number) =>
        base * Math.pow(2, targetOct - baseOct);

    const isInKey = (semi: number) =>
        keyData[selectedKey].scale.includes(semi % 12);

    const calculateTension = (
        notes: Array<{ name: string; octave: number; semitone: number }>
    ) => {
        if (notes.length === 0) return 0;

        let tensionScore = 0;
        const lastNote = notes[notes.length - 1];

        notes.forEach((note, idx) => {
            const weight = (idx + 1) / notes.length;
            const interval = Math.abs(
                (lastNote.semitone - note.semitone + 12) % 12
            );

            if ([1, 6].includes(interval)) tensionScore += 40 * weight;
            else if ([2, 10, 11].includes(interval))
                tensionScore += 20 * weight;
        });

        const isStable = [0, 4, 5, 7].includes(lastNote.semitone % 12);
        if (!isStable) tensionScore += 15;

        const isInKeyScale = keyData[selectedKey].scale.includes(
            lastNote.semitone % 12
        );
        if (!isInKeyScale) tensionScore += 25;

        return Math.min(100, tensionScore);
    };

    const categorizeNote = (targetSemi: number) => {
        if (recentNotes.length === 0) return { category: "neutral", score: 0 };

        const lastNote = recentNotes[recentNotes.length - 1];
        const interval = (targetSemi - lastNote.semitone + 12) % 12;

        let tensionAdded = 0;
        if ([1, 6].includes(interval)) tensionAdded = 40;
        else if ([2, 10, 11].includes(interval)) tensionAdded = 20;

        const isStable = [0, 4, 5, 7].includes(targetSemi % 12);
        const inKey = isInKey(targetSemi);

        const futureTension =
            tension + tensionAdded + (isStable ? -15 : 10) + (inKey ? 0 : 25);

        if (futureTension < tension - 10)
            return { category: "resolution", score: tension - futureTension };
        if (futureTension > tension + 15)
            return { category: "tension", score: futureTension - tension };
        return { category: "neutral", score: 0 };
    };

    const playNote = (freq: number, name: string, oct: number) => {
        if (!audioContext) return;
        const o = audioContext.createOscillator();
        const g = audioContext.createGain();
        o.connect(g);
        g.connect(audioContext.destination);
        o.frequency.value = freq;
        o.type = "sine";
        g.gain.setValueAtTime(0.3, audioContext.currentTime);
        g.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
        );
        o.start();
        o.stop(audioContext.currentTime + 0.5);

        const semi = baseFreqs.find((n) => n.note === name)?.semitone || 0;
        const newNote = { name, octave: oct, semitone: semi };

        if (recentNotes.length > 0) {
            const lastNote = recentNotes[recentNotes.length - 1];
            const interval = (semi - lastNote.semitone + 12) % 12;

            const intervalNames: {
                [key: number]: { name: string; emoji: string; color: string };
            } = {
                0: { name: "Unison", emoji: "🎯", color: "blue" },
                1: { name: "Minor 2nd", emoji: "😬", color: "red" },
                2: { name: "Major 2nd", emoji: "👍", color: "green" },
                3: { name: "Minor 3rd", emoji: "😊", color: "green" },
                4: { name: "Major 3rd", emoji: "✨", color: "green" },
                5: { name: "Perfect 4th", emoji: "🎵", color: "blue" },
                6: { name: "Tritone", emoji: "🔥", color: "orange" },
                7: { name: "Perfect 5th", emoji: "⭐", color: "purple" },
                8: { name: "Minor 6th", emoji: "💫", color: "green" },
                9: { name: "Major 6th", emoji: "🌟", color: "green" },
                10: { name: "Minor 7th", emoji: "🎶", color: "blue" },
                11: { name: "Major 7th", emoji: "✨", color: "blue" },
            };

            const intervalInfo = intervalNames[interval];
            if (intervalInfo) {
                setToast(intervalInfo);
                setTimeout(() => setToast(null), 1500);
            }
        }

        const newNotes = [...recentNotes.slice(-7), newNote];
        setRecentNotes(newNotes);
        setNoteHistory((p) => [...p.slice(-7), `${name}-${oct}`]);

        const newTension = calculateTension(newNotes);
        if (tension > 60 && newTension < 30) {
            setShowResolutionEffect(true);
            setTimeout(() => setShowResolutionEffect(false), 800);
        }
        setTension(newTension);
    };

    const playMultiNote = (freqs: number[], names: string[]) => {
        if (!audioContext) return;
        freqs.forEach((freq) => {
            const o = audioContext.createOscillator();
            const g = audioContext.createGain();
            o.connect(g);
            g.connect(audioContext.destination);
            o.frequency.value = freq;
            o.type = "sine";
            g.gain.setValueAtTime(0.15, audioContext.currentTime);
            g.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 1
            );
            o.start();
            o.stop(audioContext.currentTime + 1);
        });

        const notesData = names.map((name) => ({
            name,
            octave: octave,
            semitone: baseFreqs.find((n) => n.note === name)?.semitone || 0,
        }));

        const newNotes = [...recentNotes.slice(-7), ...notesData].slice(-8);
        setRecentNotes(newNotes);
        setNoteHistory((p) =>
            [...p.slice(-7), ...names.map((n) => `${n}-${octave}`)].slice(-8)
        );

        const newTension = calculateTension(newNotes);
        if (tension > 60 && newTension < 30) {
            setShowResolutionEffect(true);
            setTimeout(() => setShowResolutionEffect(false), 800);
        }
        setTension(newTension);
    };

    const getMultiNoteSuggestions = () => {
        if (recentNotes.length === 0) return [];

        const suggestions: Array<{
            notes: string[];
            freqs: number[];
            name: string;
            category: string;
        }> = [];
        const allChords = keyData[selectedKey].chords;

        allChords.forEach((chord) => {
            const noteFreqs = chord.notes
                .map((name) => {
                    const note = baseFreqs.find((n) => n.note === name);
                    return note ? getFreq(note.freq, 4, octave) : null;
                })
                .filter((f): f is number => f !== null);

            if (noteFreqs.length >= 2) {
                const rootSemi =
                    baseFreqs.find((n) => n.note === chord.root)?.semitone || 0;
                const category = categorizeNote(rootSemi);
                suggestions.push({
                    notes: chord.notes,
                    freqs: noteFreqs,
                    name: chord.name,
                    category: category.category,
                });
            }
        });

        return suggestions.slice(0, 4);
    };

    const allNotes: Array<{
        note: string;
        altName: string;
        freq: number;
        isBlack: boolean;
        semitone: number;
        displayName: string | undefined;
        octave: number;
        id: string;
        category: string;
        inKey: boolean;
    }> = [];
    for (let oct = octave; oct < octave + numOctaves; oct++) {
        baseFreqs.forEach((n) => {
            if (n.semitone < 12) {
                const displayName = getNoteName(n.semitone);
                const category = categorizeNote(n.semitone);
                allNotes.push({
                    ...n,
                    displayName,
                    freq: getFreq(n.freq, 4, oct),
                    octave: oct,
                    id: `${n.note}-${oct}`,
                    category: category.category,
                    inKey: isInKey(n.semitone),
                });
            }
        });
    }

    const whiteKeys = allNotes.filter((n) => !n.isBlack);
    const blackKeys = allNotes.filter((n) => n.isBlack);

    const getKeyStyle = (note: {
        note: string;
        octave: number;
        category: string;
        inKey: boolean;
        isBlack: boolean;
    }) => {
        const justPlayed =
            recentNotes.length > 0 &&
            recentNotes[recentNotes.length - 1].name === note.note &&
            recentNotes[recentNotes.length - 1].octave === note.octave;

        if (justPlayed)
            return "bg-yellow-300 text-yellow-900 border-yellow-500";

        if (!showSmart || recentNotes.length === 0) {
            if (note.inKey) return "bg-blue-200 text-blue-900 border-blue-400";
            return note.isBlack
                ? "bg-gray-700 text-white border-2 border-dashed border-gray-500"
                : "bg-gray-200 text-gray-700 border-2 border-dashed border-gray-400";
        }

        if (note.category === "resolution") {
            return note.inKey
                ? "bg-purple-500 text-white border-purple-700"
                : "bg-purple-400 text-white border-2 border-dashed border-purple-600 opacity-75";
        }

        if (note.category === "tension") {
            return note.inKey
                ? "bg-blue-500 text-white border-blue-700"
                : "bg-blue-400 text-white border-2 border-dashed border-blue-600 opacity-75";
        }

        if (note.inKey) return "bg-green-200 text-green-900 border-green-400";

        return note.isBlack
            ? "bg-gray-700 text-white border-2 border-dashed border-gray-500"
            : "bg-gray-200 text-gray-700 border-2 border-dashed border-gray-400";
    };

    const multiNoteSuggestions = getMultiNoteSuggestions();

    const getDotOpacity = (id: string) => {
        const pos = noteHistory.lastIndexOf(id);
        if (pos === -1) return 0;
        return Math.max(0, 1 - (noteHistory.length - pos - 1) * 0.125);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
            <div className="mb-3 flex flex-col gap-2 items-center relative">
                {toast && (
                    <div
                        className={`absolute -top-16 px-6 py-3 rounded-full shadow-lg animate-bounce text-lg font-bold z-50 ${
                            toast.color === "purple"
                                ? "bg-purple-500 text-white"
                                : toast.color === "green"
                                ? "bg-green-500 text-white"
                                : toast.color === "blue"
                                ? "bg-blue-500 text-white"
                                : toast.color === "orange"
                                ? "bg-orange-500 text-white"
                                : "bg-red-500 text-white"
                        }`}
                    >
                        {toast.emoji} {toast.name}!
                    </div>
                )}

                <div className="w-64 h-6 bg-gray-800 rounded-full overflow-hidden relative border-2 border-gray-600">
                    <div
                        className={`h-full transition-all duration-300 ${
                            tension > 70
                                ? "bg-red-500"
                                : tension > 40
                                ? "bg-orange-500"
                                : "bg-blue-500"
                        }`}
                        style={{ width: `${tension}%` }}
                    />
                    {showResolutionEffect && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 animate-pulse" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        Tension: {Math.round(tension)}%
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setOctave((p) => Math.max(1, p - 1))}
                        disabled={octave <= 1}
                        className="p-2 bg-white rounded-lg disabled:opacity-30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="text-white text-xl font-bold min-w-32 text-center">
                        Octave {octave}
                        {numOctaves > 1 && `-${octave + numOctaves - 1}`}
                    </div>
                    <button
                        onClick={() => setOctave((p) => Math.min(7, p + 1))}
                        disabled={octave >= 7}
                        className="p-2 bg-white rounded-lg disabled:opacity-30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-white text-sm font-semibold">
                        Key:
                    </label>
                    <select
                        value={selectedKey}
                        onChange={(e) => {
                            const newKey = e.target.value;
                            posthog.capture("piano_key_changed", {
                                key: newKey,
                            });
                            setSelectedKey(newKey);
                            setRecentNotes([]);
                            setNoteHistory([]);
                            setTension(0);
                        }}
                        className="px-3 py-2 rounded-lg font-semibold"
                    >
                        <option value="C">C Major</option>
                        <option value="G">G Major</option>
                        <option value="D">D Major</option>
                        <option value="F">F Major</option>
                        <option value="Am">A Minor</option>
                        <option value="Em">E Minor</option>
                    </select>

                    <button
                        onClick={() => {
                            posthog.capture("piano_smart_mode_toggled", {
                                enabled: !showSmart,
                            });
                            setShowSmart(!showSmart);
                        }}
                        className={`px-3 py-2 rounded-lg font-semibold ${
                            showSmart
                                ? "bg-blue-400 text-blue-900"
                                : "bg-gray-300 text-gray-700"
                        }`}
                    >
                        Smart
                    </button>
                </div>
            </div>

            <div className="relative mb-3">
                <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 5 }}
                >
                    {multiNoteSuggestions.map((sugg, idx) => {
                        const yStart = 250;
                        const buttonY = 280 + idx * 50;
                        const buttonX = 50 + idx * 120;

                        return (
                            <g key={idx}>
                                {sugg.notes.map((noteName, noteIdx) => {
                                    const noteKey = allNotes.find(
                                        (n) =>
                                            n.note === noteName &&
                                            n.octave === octave
                                    );
                                    if (!noteKey) return null;

                                    const keyIndex = whiteKeys.findIndex(
                                        (k) => k.id === noteKey.id
                                    );
                                    const x = keyIndex * 64 + 32;

                                    const color =
                                        sugg.category === "resolution"
                                            ? "#a855f7"
                                            : sugg.category === "tension"
                                            ? "#3b82f6"
                                            : "#22c55e";

                                    return (
                                        <g key={noteIdx}>
                                            <circle
                                                cx={x}
                                                cy={yStart - 10}
                                                r="6"
                                                fill={color}
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                            <line
                                                x1={x}
                                                y1={yStart}
                                                x2={buttonX + 40}
                                                y2={buttonY}
                                                stroke={color}
                                                strokeWidth="2"
                                                strokeDasharray="4"
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}
                </svg>

                <div className="overflow-x-auto max-w-full">
                    <div className="flex">
                        {whiteKeys.map((note, idx) => {
                            const opacity = getDotOpacity(note.id);
                            return (
                                <button
                                    key={idx}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        playNote(
                                            note.freq,
                                            note.note,
                                            note.octave
                                        );
                                    }}
                                    onClick={() =>
                                        playNote(
                                            note.freq,
                                            note.note,
                                            note.octave
                                        )
                                    }
                                    className={`w-16 h-48 border-2 active:bg-gray-300 transition-colors rounded-b-lg shadow-lg relative flex-shrink-0 ${getKeyStyle(
                                        note
                                    )}`}
                                >
                                    <span className="block mt-auto mb-2 font-semibold text-sm">
                                        {note.displayName}
                                    </span>
                                    {opacity > 0 && (
                                        <div
                                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"
                                            style={{ opacity }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="absolute top-0 left-0 flex pointer-events-none">
                        {whiteKeys.map((wk, idx) => {
                            const bk = blackKeys.find(
                                (b) =>
                                    b.octave === wk.octave &&
                                    b.semitone === wk.semitone + 1
                            );
                            if (!bk)
                                return (
                                    <div
                                        key={idx}
                                        className="w-16 flex-shrink-0"
                                    />
                                );
                            const opacity = getDotOpacity(bk.id);
                            return (
                                <div
                                    key={idx}
                                    className="relative w-16 flex-shrink-0"
                                >
                                    <button
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            playNote(
                                                bk.freq,
                                                bk.note,
                                                bk.octave
                                            );
                                        }}
                                        onClick={() =>
                                            playNote(
                                                bk.freq,
                                                bk.note,
                                                bk.octave
                                            )
                                        }
                                        className={`absolute left-9 w-10 h-32 border-2 active:bg-gray-600 transition-colors rounded-b-lg shadow-xl z-10 pointer-events-auto ${getKeyStyle(
                                            bk
                                        )}`}
                                    >
                                        <span className="block mt-auto mb-1 font-semibold text-xs">
                                            {bk.displayName}
                                        </span>
                                        {opacity > 0 && (
                                            <div
                                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                                                style={{ opacity }}
                                            />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div
                className="flex flex-wrap gap-3 justify-center mb-3 relative"
                style={{ minHeight: "60px" }}
            >
                {multiNoteSuggestions.map((sugg, idx) => {
                    const color =
                        sugg.category === "resolution"
                            ? "from-purple-500 to-purple-600"
                            : sugg.category === "tension"
                            ? "from-blue-500 to-blue-600"
                            : "from-green-500 to-green-600";
                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                posthog.capture("piano_chord_played", {
                                    chord_name: sugg.name,
                                    notes: sugg.notes,
                                    category: sugg.category,
                                    current_key: selectedKey,
                                });
                                playMultiNote(sugg.freqs, sugg.notes);
                            }}
                            className={`px-4 py-2 bg-gradient-to-b ${color} text-white rounded-lg font-bold shadow-lg active:opacity-80 flex items-center gap-2`}
                        >
                            <Music className="w-4 h-4" />
                            {sugg.name}
                        </button>
                    );
                })}
            </div>
            {showSmart && (
                <div className="text-center max-w-md bg-white bg-opacity-10 px-4 py-3 rounded-lg">
                    {recentNotes.length > 0 ? (
                        <div className="text-sm space-y-1">
                            <div className="text-yellow-200 font-semibold">
                                Playing:{" "}
                                {recentNotes
                                    .slice(-3)
                                    .map((n) => n.name)
                                    .join(", ")}
                            </div>
                            <div className="flex items-center justify-center gap-3 text-xs mt-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                    <span className="text-purple-200">
                                        Resolution
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-green-200">
                                        Neutral
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span className="text-blue-200">
                                        Tension
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-blue-200 text-sm">
                            Play notes to see tension tracking and suggestions!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
