"use client";

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Settings = dynamic(() => import("@/components/tools/settings"), {
  loading: () => <div className="p-4 text-[rgb(var(--text-secondary))]">Loading Settings...</div>,
  ssr: false,
});

const Contact = dynamic(() => import("@/components/tools/contact"), {
  loading: () => <div className="p-4 text-[rgb(var(--text-secondary))]">Loading Contact...</div>,
  ssr: false,
});

const About = dynamic(() => import("@/components/tools/about"), {
  loading: () => <div className="p-4 text-[rgb(var(--text-secondary))]">Loading About...</div>,
  ssr: false,
});

interface LeftPanelProps {
  onNiIconClick: () => void;
}

export function LeftPanel({ onNiIconClick }: LeftPanelProps) {
  return (
    <div className="h-full w-full bg-[rgb(var(--bg-desktop))] flex flex-col overflow-hidden">
      {/* Header with Ni icon */}
      <div className="p-6 border-b border-[rgb(var(--border-window))] flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onNiIconClick}
            className="w-12 h-12 bg-[rgb(var(--bg-button))] rounded-xl flex items-center justify-center font-mono text-sm font-bold text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-button-hover))] transition-colors active:scale-95"
            aria-label="Navigate to search"
          >
            Ni
          </button>
          <div>
            <div className="font-bold text-lg text-[rgb(var(--text-primary))]">NICKEL</div>
            <div className="text-xs text-[rgb(var(--text-secondary))] font-mono">ELEMENT 28 / FOUNDRY</div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* Settings Section */}
          <div className="bg-[rgb(var(--bg-window))] rounded-lg p-4 border border-[rgb(var(--border-window))]">
            <Settings />
          </div>

          {/* Contact Section */}
          <div className="bg-[rgb(var(--bg-window))] rounded-lg p-4 border border-[rgb(var(--border-window))]">
            <Contact />
          </div>

          {/* About Section */}
          <div className="bg-[rgb(var(--bg-window))] rounded-lg p-4 border border-[rgb(var(--border-window))]">
            <About />
          </div>
        </div>
      </div>
    </div>
  );
}

