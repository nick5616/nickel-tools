"use client";

import React, { useState } from 'react';

interface FaviconProps {
  url: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export function Favicon({ url, size = 32, className = '', fallback }: FaviconProps) {
  const [imgError, setImgError] = useState(false);

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
      onError={() => setImgError(true)}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

