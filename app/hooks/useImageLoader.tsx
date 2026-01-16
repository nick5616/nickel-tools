"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from "react";

interface ImageLoaderContextType {
    registerImage: (id: string) => void;
    markImageLoaded: (id: string) => void;
    markImageError: (id: string) => void;
    allImagesLoaded: boolean;
}

const ImageLoaderContext = createContext<ImageLoaderContextType | null>(null);

export function ImageLoaderProvider({ children }: { children: ReactNode }) {
    const [imageStates, setImageStates] = useState<
        Record<string, "loading" | "loaded" | "error">
    >({});
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);
    const [initializationComplete, setInitializationComplete] = useState(false);
    const prevAllLoadedRef = useRef<boolean | null>(null);

    // Give components time to register images
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitializationComplete(true);
        }, 300); // Small delay to allow components to mount and register
        return () => clearTimeout(timer);
    }, []);

    // Safety timeout: if loading takes too long, mark as loaded anyway
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            setAllImagesLoaded((prev) => {
                if (prev) return prev; // Already true, no change needed
                console.warn(
                    "ImageLoader: Safety timeout reached, marking all images as loaded"
                );
                return true;
            });
        }, 10000); // 10 second safety timeout
        return () => clearTimeout(safetyTimer);
    }, []); // Only run once on mount

    const registerImage = useCallback((id: string) => {
        setImageStates((prev) => {
            if (prev[id]) return prev; // Already registered
            return { ...prev, [id]: "loading" };
        });
    }, []);

    const markImageLoaded = useCallback((id: string) => {
        setImageStates((prev) => {
            if (prev[id] === "loaded") return prev; // Already loaded, no change needed
            return { ...prev, [id]: "loaded" };
        });
    }, []);

    const markImageError = useCallback((id: string) => {
        setImageStates((prev) => {
            if (prev[id] === "error") return prev; // Already error, no change needed
            return { ...prev, [id]: "error" };
        });
    }, []);

    // Check if all images are loaded
    useEffect(() => {
        if (!initializationComplete) {
            return; // Wait for initialization
        }

        const states = Object.values(imageStates);
        if (states.length === 0) {
            // No images to load, consider it ready
            // But wait a bit more to see if images register
            const timer = setTimeout(() => {
                setAllImagesLoaded((prev) => {
                    if (prev) return prev; // Already true, no change needed
                    return true;
                });
            }, 1000); // Wait 1 second to see if any images register
            return () => clearTimeout(timer);
        }

        // Check for images stuck in loading state and mark them as error after timeout
        const loadingImageIds = Object.entries(imageStates)
            .filter(([_, state]) => state === "loading")
            .map(([id]) => id);

        if (loadingImageIds.length > 0) {
            const stuckTimer = setTimeout(() => {
                setImageStates((prev) => {
                    const updated = { ...prev };
                    loadingImageIds.forEach((id) => {
                        if (updated[id] === "loading") {
                            console.warn(
                                `ImageLoader: Image ${id} stuck in loading, marking as error`
                            );
                            updated[id] = "error";
                        }
                    });
                    return updated;
                });
            }, 5000); // 5 second timeout for individual images
            return () => clearTimeout(stuckTimer);
        }

        const allLoaded = states.every(
            (state) => state === "loaded" || state === "error"
        );
        // Only update if the value has actually changed to prevent infinite loops
        if (prevAllLoadedRef.current !== allLoaded) {
            prevAllLoadedRef.current = allLoaded;
            setAllImagesLoaded(allLoaded);
        }
    }, [imageStates, initializationComplete]);

    return (
        <ImageLoaderContext.Provider
            value={{
                registerImage,
                markImageLoaded,
                markImageError,
                allImagesLoaded,
            }}
        >
            {children}
        </ImageLoaderContext.Provider>
    );
}

export function useImageLoader() {
    const context = useContext(ImageLoaderContext);
    if (!context) {
        throw new Error(
            "useImageLoader must be used within ImageLoaderProvider"
        );
    }
    return context;
}

/**
 * Hook to track when all app thumbnails and images are loaded
 * This is a simpler version that just checks if we're ready
 */
export function useAllImagesLoaded(): boolean {
    const { allImagesLoaded } = useImageLoader();
    return allImagesLoaded;
}
