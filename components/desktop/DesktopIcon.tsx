"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { Content } from '@/app/data/content';
import { IconRenderer } from '@/components/shared/IconRenderer';

interface DesktopIconProps {
  content: Content;
  position: { x: number; y: number };
  onDoubleClick: (content: Content) => void;
  onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

export function DesktopIcon({ content, position, onDoubleClick, onContextMenu }: DesktopIconProps) {
  return (
    <motion.div
      className="absolute cursor-pointer select-none group"
      style={{ 
        left: `${Math.max(10, position.x)}px`, 
        top: `${position.y}px`,
        maxWidth: '96px',
        right: 'auto',
      }}
      onDoubleClick={() => onDoubleClick(content)}
      onContextMenu={(e) => onContextMenu?.(e, content)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center w-24 p-2 rounded hover:bg-white/10 dark:hover:bg-white/10 transition-colors">
        <div className="text-4xl mb-1 group-hover:scale-110 transition-transform flex items-center justify-center">
          <IconRenderer content={content} size="lg" className="text-zinc-200" />
        </div>
        <div className="text-xs text-center text-white/90 dark:text-white/90 leading-tight px-1">
          {content.title}
        </div>
      </div>
    </motion.div>
  );
}

