"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    Image as ImageIcon,
    LayoutDashboard,
    LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listGCSFolder } from "@/app/utils/gcs";

const getGalleryDescription = (
    folder:
        | "digital-art"
        | "paintings"
        | "sketches"
        | "lefthanded"
        | "miscellaneous"
        | "notesappart"
) => {
    switch (folder) {
        case "digital-art":
            return "I've been making digital art on the iPad (Procreate) since 2021. Here are some of my favorite pieces I've made throughout the years.";
        case "paintings":
            return "I've dabbled (if you can even call it that) in acrylic painting since 2020.";
        case "lefthanded":
            return "In 2025, I decided I wanted to learn how to draw with my left (non-dominant) hand. I'm quite the stubborn person, so it's bothered me that my left hand is not as dextrous as my right. I'd like to become ambidextrous :)";
        case "sketches":
            return "I've sketched for as long as I can remember. Though, I didn't sketch any in my adult life. Before 2025, the last time I could remember drawing pencil and/or pen on paper was like 2017, and that was on school assignments. In October 2025, I decided I would keep a sketchbook. I'd never had one in my life, and I can proudly say I've filled it out! As of November 2025, I'm on my second sketchbook!";
        case "miscellaneous":
            return "A collection of miscellaneous artwork and creative pieces.";
        case "notesappart":
            return "Art created in note-taking apps and other digital tools.";
        default:
            return "";
    }
};
interface ArtGalleryProps {
    folder:
        | "digital-art"
        | "paintings"
        | "sketches"
        | "lefthanded"
        | "miscellaneous"
        | "notesappart";
}

interface ArtImage {
    id: string;
    url: string;
    filename: string;
    date?: string;
    description?: string;
    dimensions?: { width: number; height: number };
}

export default function ArtGallery({ folder }: ArtGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<ArtImage | null>(null);
    const [images, setImages] = useState<ArtImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [layout, setLayout] = useState<"masonry" | "grid">("masonry");

    React.useEffect(() => {
        async function fetchImages() {
            try {
                setLoading(true);
                setError(null);

                const result = await listGCSFolder(folder);
                // Filter to only image files and transform to ArtImage format
                const imageFiles = result.files
                    .filter((file) => {
                        const contentType = file.contentType || "";
                        const filename = file.filename.toLowerCase();
                        return (
                            (contentType.startsWith("image/") ||
                                /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
                                    filename
                                )) &&
                            file.private !== "true"
                        );
                    })
                    .map((file) => ({
                        id: file.name,
                        url: file.url,
                        filename: file.filename,
                        date: file.created, // Only use custom "created" metadata if it exists
                        description: file.description, // Optional description from metadata
                        dimensions: undefined, // Could be fetched later if needed
                    }));

                setImages(imageFiles);
            } catch (err) {
                console.error("Error fetching images:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load gallery"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchImages();
    }, [folder]);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-[rgb(var(--text-primary)/0.1)] border-t-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-fg-l))] mx-auto mb-3"></div>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Loading gallery…
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full overflow-auto p-8">
                <div className="max-w-md mx-auto">
                    <div className="nk-banner nk-banner-error flex-col !items-start">
                        <p className="font-semibold">Couldn&apos;t load this gallery</p>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (images.length === 0 && !loading) {
        return (
            <div className="h-full w-full overflow-auto p-8">
                <div className="max-w-md mx-auto">
                    <div className="nk-group p-10 text-center">
                        <ImageIcon
                            size={40}
                            className="text-[rgb(var(--text-secondary))] mx-auto mb-3"
                        />
                        <p className="font-semibold mb-1">No images found</p>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            This folder appears to be empty or contains no image
                            files.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedImage) {
        const meta = [
            selectedImage.date && `Created: ${selectedImage.date}`,
            selectedImage.dimensions &&
                `${selectedImage.dimensions.width} × ${selectedImage.dimensions.height}`,
        ].filter(Boolean);

        return (
            <div className="h-full w-full flex flex-col gap-3 bg-black/95 p-4">
                <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="nk-btn !text-white !bg-white/10 hover:!bg-white/20"
                    >
                        <ArrowLeft size={16} />
                        Gallery
                    </button>

                    <div className="min-w-0 text-right">
                        <h2
                            className="truncate text-sm sm:text-base font-semibold text-white"
                            title={selectedImage.filename}
                        >
                            {selectedImage.filename}
                        </h2>
                        {meta.length > 0 && (
                            <p className="truncate text-xs text-zinc-400">
                                {meta.join(" · ")}
                            </p>
                        )}
                    </div>
                </div>

                <motion.div
                    key={selectedImage.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 min-h-0 flex items-center justify-center"
                >
                    <img
                        src={selectedImage.url}
                        alt={selectedImage.filename}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </motion.div>

                {selectedImage.description && (
                    <p className="w-full max-w-6xl mx-auto text-center text-sm text-zinc-300 line-clamp-2">
                        {selectedImage.description}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-auto">
            <div className="nk-toolbar justify-between">
                <span className="text-sm font-semibold">
                    {images.length} pieces
                </span>
                <div className="nk-segmented">
                        {(
                            [
                                ["masonry", "Masonry", LayoutDashboard],
                                ["grid", "Grid", LayoutGrid],
                            ] as const
                        ).map(([mode, label, Icon]) => (
                            <button
                                key={mode}
                                onClick={() => setLayout(mode)}
                                aria-pressed={layout === mode}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                </div>
            </div>
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))] mb-5 max-w-prose">
                    {getGalleryDescription(folder)}
                </p>
                <div
                    className={
                        layout === "masonry"
                            ? "columns-2 md:columns-3 lg:columns-4 gap-4"
                            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    }
                >
                    <AnimatePresence>
                        {images.map((image) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-[rgb(var(--text-primary)/0.06)] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group ${
                                    layout === "masonry"
                                        ? "mb-4 break-inside-avoid"
                                        : "aspect-square"
                                }`}
                                onClick={() => setSelectedImage(image)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.filename}
                                    className={`w-full group-hover:scale-105 transition-transform duration-300 ${
                                        layout === "masonry"
                                            ? "h-auto block"
                                            : "h-full object-cover"
                                    }`}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
