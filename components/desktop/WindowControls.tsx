"use client";

import React from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize?: () => void;
  onClose: () => void;
}

export function WindowControls({ onMinimize, onMaximize, onClose }: WindowControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onMinimize}
        className="w-6 h-6 rounded hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors"
        aria-label="Minimize"
        title="Minimize"
      >
        <Minus size={14} />
      </button>
      {onMaximize && (
        <button
          onClick={onMaximize}
          className="w-6 h-6 rounded hover:bg-[rgb(var(--bg-titlebar-hover))] flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-[rgb(var(--text-titlebar))] transition-colors"
          aria-label="Maximize"
          title="Maximize / Restore"
        >
          <Square size={14} />
        </button>
      )}
      <button
        onClick={onClose}
        className="w-6 h-6 rounded hover:bg-red-500 dark:hover:bg-red-600 flex items-center justify-center text-[rgb(var(--text-titlebar))]/70 hover:text-white transition-colors"
        aria-label="Close"
        title="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
}

