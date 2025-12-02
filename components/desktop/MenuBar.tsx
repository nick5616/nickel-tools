"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function MenuBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-zinc-900/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-700 dark:border-zinc-800 px-4 py-2 flex items-center justify-between z-50 h-12">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-700 dark:bg-zinc-800 rounded flex items-center justify-center font-mono text-sm font-bold text-white">
            Ni
          </div>
          <span className="font-bold text-white">NICKEL</span>
          <span className="text-xs text-zinc-500 font-mono">ELEMENT 28 / FOUNDRY</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-400">
          <button className="hover:text-zinc-200 transition-colors">File</button>
          <button className="hover:text-zinc-200 transition-colors">View</button>
          <button className="hover:text-zinc-200 transition-colors">Art</button>
          <button className="hover:text-zinc-200 transition-colors">Tools</button>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
        aria-label="Toggle theme"
      >
        {mounted && theme === 'dark' ? (
          <Sun size={16} className="text-zinc-300" />
        ) : (
          <Moon size={16} className="text-zinc-300" />
        )}
      </button>
    </div>
  );
}

