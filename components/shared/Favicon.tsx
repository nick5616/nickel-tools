"use client";

import React, { useState, useEffect, useRef } from "react";
import { useImageLoader } from "@/app/hooks/useImageLoader";

interface FaviconProps {
    url: string;
    size?: number;
    className?: string;
    contentId?: string; // Optional content ID for tracking
    fallback?: React.ReactNode; // Fallback to show if all icon sources fail
}

export function Favicon({
    url,
    size = 32,
    className = "",
    contentId,
    fallback,
}: FaviconProps) {
    const [imgError, setImgError] = useState(false);
    const [currentFaviconUrl, setCurrentFaviconUrl] = useState<string | null>(
        null
    );
    const [parsedIcons, setParsedIcons] = useState<string[]>([]);
    const { registerImage, markImageLoaded, markImageError } = useImageLoader();
    const hasFetchedRef = useRef(false);

    // Register favicon loading if contentId is provided
    useEffect(() => {
        if (contentId) {
            registerImage(`favicon-${contentId}`);
        }
    }, [contentId, registerImage]);

    // Extract domain and base URL from URL
    const getDomainAndBase = (
        urlString: string
    ): { domain: string; baseUrl: string } => {
        try {
            const urlObj = new URL(urlString);
            return {
                domain: urlObj.hostname.replace("www.", ""),
                baseUrl: `${urlObj.protocol}//${urlObj.hostname}`,
            };
        } catch {
            // If URL parsing fails, try to extract domain manually
            const match = urlString.match(/https?:\/\/(?:www\.)?([^\/]+)/);
            const domain = match ? match[1] : urlString;
            const protocol = urlString.startsWith("https") ? "https" : "http";
            return {
                domain,
                baseUrl: `${protocol}://${domain}`,
            };
        }
    };

    const { domain, baseUrl } = getDomainAndBase(url);

    // Resolve relative URL to absolute
    const resolveUrl = (href: string, base: string): string => {
        try {
            return new URL(href, base).href;
        } catch {
            return href;
        }
    };

    // Fetch HTML and parse for icon links
    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchIcons = async () => {
            try {
                const response = await fetch(
                    `/api/favicon?url=${encodeURIComponent(url)}`
                );
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                const html = data.html;

                // Parse HTML for icon links
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const iconLinks: string[] = [];

                // Find all link tags with icon-related rel attributes
                const linkTags = doc.querySelectorAll(
                    'link[rel*="icon"], link[rel*="apple-touch-icon"], link[rel="shortcut icon"]'
                );
                linkTags.forEach((link) => {
                    const href = link.getAttribute("href");
                    if (href) {
                        const absoluteUrl = resolveUrl(href, baseUrl);
                        iconLinks.push(absoluteUrl);
                    }
                });

                // Sort by priority: apple-touch-icon first, then by size (larger first)
                iconLinks.sort((a, b) => {
                    const aIsApple = a.includes("apple-touch-icon");
                    const bIsApple = b.includes("apple-touch-icon");
                    if (aIsApple && !bIsApple) return -1;
                    if (!aIsApple && bIsApple) return 1;

                    // Extract size from filename if possible
                    const aSize = parseInt(a.match(/(\d+)x\d+/)?.[1] || "0");
                    const bSize = parseInt(b.match(/(\d+)x\d+/)?.[1] || "0");
                    return bSize - aSize;
                });

                setParsedIcons(iconLinks);
            } catch (error) {
                // If fetch fails, continue with common paths
                console.error("Failed to fetch HTML for icons:", error);
            }
        };

        fetchIcons();
    }, [url, baseUrl]);

    // Combine parsed icons with common fallback paths
    const faviconSources = React.useMemo(() => {
        const commonPaths = [
            `${baseUrl}/icon.svg`,
            `${baseUrl}/favicon.svg`,
            `${baseUrl}/apple-touch-icon.png`,
            `${baseUrl}/icon-512x512.png`,
            `${baseUrl}/icon-192x192.png`,
            `${baseUrl}/favicon-32x32.png`,
            `${baseUrl}/favicon.png`,
            `${baseUrl}/favicon.ico`,
        ];

        // Remove duplicates and combine
        const allSources = [...parsedIcons];
        commonPaths.forEach((path) => {
            if (!allSources.includes(path)) {
                allSources.push(path);
            }
        });

        return allSources;
    }, [baseUrl, parsedIcons]);

    const currentSourceIndexRef = useRef(0);

    // Initialize with first source when sources are available
    useEffect(() => {
        if (faviconSources.length > 0) {
            setCurrentFaviconUrl(faviconSources[0]);
            currentSourceIndexRef.current = 0;
            setImgError(false);
        }
    }, [faviconSources]);

    const handleLoad = () => {
        if (contentId) {
            markImageLoaded(`favicon-${contentId}`);
        }
    };

    const handleError = () => {
        // Try next source if available
        const nextIndex = currentSourceIndexRef.current + 1;
        if (nextIndex < faviconSources.length) {
            currentSourceIndexRef.current = nextIndex;
            setCurrentFaviconUrl(faviconSources[nextIndex]);
        } else {
            // All sources failed
            setImgError(true);
            if (contentId) {
                markImageError(`favicon-${contentId}`);
            }
        }
    };

    if (imgError || !currentFaviconUrl) {
        return fallback || null;
    }

    return (
        <img
            key={currentFaviconUrl}
            src={currentFaviconUrl}
            alt={`${domain} favicon`}
            width={size}
            height={size}
            className={`rounded ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{ width: size, height: size, objectFit: "contain" }}
        />
    );
}
