"use client";

import React, { useState } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listGCSFolder } from "@/app/utils/gcs";

interface ArtGalleryProps {
    folder: "digital-art" | "paintings" | "sketches";
}

interface ArtImage {
    id: string;
    url: string;
    filename: string;
    date?: string;
    dimensions?: { width: number; height: number };
}

export default function ArtGallery({ folder }: ArtGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<ArtImage | null>(null);
    const [images, setImages] = useState<ArtImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                            contentType.startsWith("image/") ||
                            /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename)
                        );
                    })
                    .map((file, index) => ({
                        id: file.name,
                        url: file.url,
                        filename: file.filename,
                        date: file.created, // Only use custom "created" metadata if it exists
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

    const folderNames: Record<string, string> = {
        "digital-art": "Digital Art",
        paintings: "Paintings",
        sketches: "Sketches",
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600 dark:border-zinc-400 mx-auto mb-4"></div>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Loading gallery...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-12 border border-red-200 dark:border-red-800 text-center">
                        <p className="text-lg text-red-600 dark:text-red-400 mb-2">
                            Error loading gallery
                        </p>
                        <p className="text-sm text-red-500 dark:text-red-500">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (images.length === 0 && !loading) {
        return (
            <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-12 border border-zinc-200 dark:border-zinc-700 text-center">
                        <ImageIcon
                            size={48}
                            className="text-zinc-400 dark:text-zinc-500 mx-auto mb-4"
                        />
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
                            No images found
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            This folder appears to be empty or contains no image
                            files.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedImage) {
        return (
            <div className="h-full w-full overflow-auto bg-black/95 p-8">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="mb-4 flex items-center gap-2 text-white hover:text-zinc-300 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Gallery</span>
                    </button>

                    <div className="bg-zinc-900 rounded-lg p-4 mb-4">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {selectedImage.filename}
                        </h2>
                        {selectedImage.date && (
                            <p className="text-sm text-zinc-400">
                                Date: {selectedImage.date}
                            </p>
                        )}
                        {selectedImage.dimensions && (
                            <p className="text-sm text-zinc-400">
                                Dimensions: {selectedImage.dimensions.width} ×{" "}
                                {selectedImage.dimensions.height}
                            </p>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center"
                    >
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.filename}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    I've been making digital art on the iPad (Procreate) since
                    2021. Here are some of my favorite pieces I've made
                    throughout the years.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {images.map((image) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-zinc-400 dark:ring-zinc-600 transition-all group"
                                onClick={() => setSelectedImage(image)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.filename}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
