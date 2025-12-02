"use client";

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import type { WindowState } from '@/app/store/appStore';
import { useAppStore } from '@/app/store/appStore';
import { WindowControls } from './WindowControls';
import { ContentRenderer } from '@/components/shared/ContentRenderer';
import { IconRenderer } from '@/components/shared/IconRenderer';

interface AppWindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

export function AppWindow({ window, onClose, onMinimize, onFocus }: AppWindowProps) {
  const { updateWindowPosition, updateWindowSize } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    updateWindowPosition(window.id, { x: d.x, y: d.y });
    setIsDragging(false);
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    updateWindowSize(window.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    updateWindowPosition(window.id, position);
  };

  return (
    <AnimatePresence>
      <Rnd
        size={{ width: window.size.width, height: window.size.height }}
        position={{ x: window.position.x, y: window.position.y }}
        onDragStart={() => {
          setIsDragging(true);
          onFocus();
        }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        minWidth={400}
        minHeight={300}
        bounds="window"
        style={{ zIndex: window.zIndex }}
        className="app-window"
        dragHandleClassName="window-titlebar"
      >
        <motion.div
          className="h-full w-full bg-zinc-800 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={onFocus}
        >
          {/* Title Bar */}
          <div
            className="window-titlebar bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-700 dark:border-zinc-700 px-4 py-2 flex items-center justify-between cursor-move select-none"
            onMouseDown={onFocus}
          >
            <div className="flex items-center gap-2">
              <IconRenderer content={window.content} size="sm" className="text-zinc-300" />
              <span className="text-sm text-white font-medium">{window.content.title}</span>
            </div>
            <WindowControls
              onMinimize={onMinimize}
              onClose={onClose}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-zinc-900 dark:bg-zinc-900">
            <ContentRenderer content={window.content} />
          </div>
        </motion.div>
      </Rnd>
    </AnimatePresence>
  );
}

