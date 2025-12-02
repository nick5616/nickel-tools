"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBar } from './StatusBar';
import { AppGrid } from './AppGrid';
import { BottomNav } from './BottomNav';
import { ContentRenderer } from '@/components/shared/ContentRenderer';
import { getAllContent } from '@/app/data/content';
import type { Content } from '@/app/data/content';
import { X } from 'lucide-react';

export function MobileOS() {
  const allContent = getAllContent();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const handleOpenItem = (content: Content) => {
    setSelectedContent(content);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  return (
    <div className="h-screen bg-zinc-950 dark:bg-zinc-950 text-white overflow-hidden flex flex-col">
      <StatusBar />

      {/* Header */}
      <div className="p-6 border-b border-zinc-800 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-mono text-sm font-bold text-white">
            Ni
          </div>
          <div>
            <div className="font-bold text-lg text-white">NICKEL</div>
            <div className="text-xs text-zinc-500 font-mono">ELEMENT 28 / FOUNDRY</div>
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 overflow-auto pb-20">
        <AppGrid content={allContent} onOpenItem={handleOpenItem} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Full Screen Modal for Content */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            className="fixed inset-0 bg-zinc-950 dark:bg-zinc-950 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-zinc-800 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{selectedContent.title}</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <ContentRenderer content={selectedContent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

