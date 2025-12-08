"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Content } from '@/app/data/content';
import { IconRenderer } from '@/components/shared/IconRenderer';

interface AppIconProps {
  content: Content;
  onClick: () => void;
}

export function AppIcon({ content, onClick }: AppIconProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsRevolving, setNeedsRevolving] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setNeedsRevolving(textWidth > containerWidth);
    }
  }, [content.title]);

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[rgb(var(--bg-button-hover))] transition-colors w-full"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-16 h-16 bg-[rgb(var(--bg-button))] rounded-2xl flex items-center justify-center">
        <IconRenderer content={content} size="lg" className="text-[rgb(var(--text-primary))]" />
      </div>
      <div 
        ref={containerRef}
        className="w-16 overflow-hidden text-xs text-center leading-tight text-[rgb(var(--text-primary))] relative"
      >
        <div
          ref={textRef}
          className={`whitespace-nowrap ${needsRevolving ? 'animate-revolve' : ''}`}
          style={needsRevolving ? {
            animation: `revolve ${Math.max(3, content.title.length * 0.1)}s linear infinite`
          } : {}}
        >
          {content.title}
          {needsRevolving && (
            <span className="ml-4">{content.title}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

