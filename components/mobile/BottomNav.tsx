"use client";

import React from 'react';
import { Home, Search } from 'lucide-react';

interface BottomNavProps {
  onHome?: () => void;
  onSearch?: () => void;
}

export function BottomNav({ onHome, onSearch }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 dark:bg-zinc-900 border-t border-zinc-800 dark:border-zinc-800 px-4 py-2 flex items-center justify-around z-40">
      <button
        onClick={onHome}
        className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <Home size={20} />
        <span className="text-xs">Home</span>
      </button>
      <button
        onClick={onSearch}
        className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <Search size={20} />
        <span className="text-xs">Search</span>
      </button>
    </div>
  );
}

