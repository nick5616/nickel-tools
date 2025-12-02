"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { Content } from '@/app/data/content';
import { IconRenderer } from '@/components/shared/IconRenderer';

interface DockProps {
  items: Content[];
  onOpenItem: (content: Content) => void;
}

export function Dock({ items, onOpenItem }: DockProps) {
  return (
    <div 
      className="fixed bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none"
      style={{
        width: '100vw',
        maxWidth: '100vw',
      }}
    >
      <motion.div
        className="bg-zinc-900/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 dark:border-zinc-800 rounded-2xl px-3 py-2 flex gap-2 shadow-2xl pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onOpenItem(item)}
            className="w-12 h-12 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-2xl hover:scale-110 transition-all relative group"
            title={item.title}
            whileHover={{ scale: 1.2, y: -10 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <IconRenderer content={item} size="md" className="text-zinc-200" />
            <div className="absolute bottom-full mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.title}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

