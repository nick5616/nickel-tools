"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { Content } from '@/app/data/content';
import { IconRenderer } from '@/components/shared/IconRenderer';

interface AppIconProps {
  content: Content;
  onClick: () => void;
}

export function AppIcon({ content, onClick }: AppIconProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors w-full"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-16 h-16 bg-zinc-800 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
        <IconRenderer content={content} size="lg" className="text-zinc-200" />
      </div>
      <div className="text-xs text-center leading-tight text-zinc-200 dark:text-zinc-200">
        {content.title}
      </div>
    </motion.button>
  );
}

