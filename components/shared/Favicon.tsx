"use client";

import React, { useState, useEffect } from 'react';
import { useImageLoader } from '@/app/hooks/useImageLoader';

interface FaviconProps {
  url: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  contentId?: string; // Optional content ID for tracking
}

export function Favicon({ url, size = 32, className = '', fallback, contentId }: FaviconProps) {
  const [imgError, setImgError] = useState(false);
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState<string | null>(null);
  const { registerImage, markImageLoaded, markImageError } = useImageLoader();

  // Register favicon loading if contentId is provided
  useEffect(() => {
    if (contentId) {
      registerImage(`favicon-${contentId}`);
    }
  }, [contentId, registerImage]);

  // Extract domain and base URL from URL
  const getDomainAndBase = (urlString: string): { domain: string; baseUrl: string } => {
    try {
      const urlObj = new URL(urlString);
      return {
        domain: urlObj.hostname.replace('www.', ''),
        baseUrl: `${urlObj.protocol}//${urlObj.hostname}`
      };
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = urlString.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      const domain = match ? match[1] : urlString;
      const protocol = urlString.startsWith('https') ? 'https' : 'http';
      return {
        domain,
        baseUrl: `${protocol}://${domain}`
      };
    }
  };

  const { domain, baseUrl } = getDomainAndBase(url);
  
  // Try multiple favicon sources in order of preference
  const faviconSources = React.useMemo(() => [
    `${baseUrl}/favicon.ico`, // Direct favicon from the site
    `${baseUrl}/favicon.png`, // Alternative favicon location
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`, // Google's service
  ], [baseUrl, domain, size]);

  const currentSourceIndexRef = React.useRef(0);

  // Initialize with first source
  useEffect(() => {
    setCurrentFaviconUrl(faviconSources[0]);
    currentSourceIndexRef.current = 0;
    setImgError(false);
  }, [faviconSources]); // Reset when sources change

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
      // All sources failed, show fallback
      setImgError(true);
      if (contentId) {
        markImageError(`favicon-${contentId}`);
      }
    }
  };

  if (imgError) {
    return fallback || (
      <div 
        className={`bg-zinc-700 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-zinc-400">🌐</span>
      </div>
    );
  }

  if (!currentFaviconUrl) {
    return fallback || (
      <div 
        className={`bg-zinc-700 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-zinc-400">🌐</span>
      </div>
    );
  }

  return (
    <img
      key={currentFaviconUrl} // Key forces re-render when URL changes
      src={currentFaviconUrl}
      alt={`${domain} favicon`}
      width={size}
      height={size}
      className={`rounded ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

