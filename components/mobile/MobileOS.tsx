"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { StatusBar } from './StatusBar';
import { AppGrid } from './AppGrid';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { ContentRenderer } from '@/components/shared/ContentRenderer';
import { getAllContent } from '@/app/data/content';
import type { Content } from '@/app/data/content';
import { X } from 'lucide-react';

export function MobileOS() {
  const allContent = getAllContent();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // -1: left, 0: main, 1: right
  const [pageWidth, setPageWidth] = useState(375);
  const x = useMotionValue(0);

  // Get page width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Update x position when pageWidth or currentPage changes
  useEffect(() => {
    x.set(-pageWidth * (currentPage + 1));
  }, [currentPage, pageWidth, x]);

  const handleOpenItem = (content: Content) => {
    setSelectedContent(content);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  const handleNiIconClick = () => {
    setCurrentPage(1); // Navigate to right panel (search/categories)
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = pageWidth * 0.15; // 15% threshold - very sensitive
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const isMouse = _event.type.startsWith('mouse');

    // For mouse drags, be more lenient with velocity (mouse drags are slower)
    const velocityThreshold = isMouse ? 100 : 200;

    // Velocity-based detection - very sensitive
    if (Math.abs(velocity) > velocityThreshold) {
      // Fast swipe - change page based on velocity direction
      if (velocity < 0 && currentPage < 1) {
        setCurrentPage(currentPage + 1);
        return;
      } else if (velocity > 0 && currentPage > -1) {
        setCurrentPage(currentPage - 1);
        return;
      }
    }
    
    // Distance-based detection - very sensitive threshold
    if (Math.abs(offset) > threshold) {
      if (offset < 0 && currentPage < 1) {
        setCurrentPage(currentPage + 1);
        return;
      } else if (offset > 0 && currentPage > -1) {
        setCurrentPage(currentPage - 1);
        return;
      }
    }
    
    // If no change, snap back to current page
    // The animate prop will handle this automatically
  };

  // Update x position when currentPage changes programmatically
  useEffect(() => {
    x.set(-pageWidth * (currentPage + 1));
  }, [currentPage, pageWidth, x]);

  return (
    <div className="h-screen bg-[rgb(var(--bg-desktop))] text-[rgb(var(--text-primary))] overflow-hidden flex flex-col">
      <StatusBar />

      {/* Swipeable Container */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex h-full"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -pageWidth * 2, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={{ x: -pageWidth * (currentPage + 1) }}
          transition={{ type: "spring", stiffness: 500, damping: 50 }}
        >
          {/* Left Panel (Settings/Contact/About) */}
          <div className="w-screen h-full flex-shrink-0">
            <LeftPanel onNiIconClick={handleNiIconClick} />
          </div>

          {/* Main Grid (App Grid) */}
          <div className="w-screen h-full flex-shrink-0">
            <div className="h-full overflow-auto pb-20">
              <AppGrid content={allContent} onOpenItem={handleOpenItem} />
            </div>
          </div>

          {/* Right Panel (Search/Categories) */}
          <div className="w-screen h-full flex-shrink-0">
            <RightPanel 
              onOpenItem={handleOpenItem}
            />
          </div>
        </motion.div>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center gap-2 py-2">
        {[-1, 0, 1].map((page) => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentPage === page
                ? 'bg-[rgb(var(--accent-nickel))] w-6'
                : 'bg-[rgb(var(--text-secondary))] opacity-50'
            }`}
            aria-label={`Go to page ${page + 2}`}
          />
        ))}
      </div>

      {/* Full Screen Modal for Content */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            className="fixed inset-0 bg-[rgb(var(--bg-desktop))] z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-[rgb(var(--border-window))] flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{selectedContent.title}</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-[rgb(var(--bg-button-hover))] flex items-center justify-center text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
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

