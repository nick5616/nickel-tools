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
  const { registerImage, markImageLoaded, markImageError } = useImageLoader();

  // Register favicon loading if contentId is provided
  useEffect(() => {
    if (contentId) {
      registerImage(`favicon-${contentId}`);
    }
  }, [contentId, registerImage]);

  // Extract domain from URL
  const getDomain = (urlString: string): string => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname.replace('www.', '');
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = urlString.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      return match ? match[1] : urlString;
    }
  };

  const domain = getDomain(url);
  
  // Use Google's favicon service
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;

  const handleLoad = () => {
    if (contentId) {
      markImageLoaded(`favicon-${contentId}`);
    }
  };

  const handleError = () => {
    setImgError(true);
    if (contentId) {
      markImageError(`favicon-${contentId}`);
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

  return (
    <img
      src={faviconUrl}
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

