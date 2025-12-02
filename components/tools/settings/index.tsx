"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Monitor, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [defaultWindowWidth, setDefaultWindowWidth] = useState(800);
  const [defaultWindowHeight, setDefaultWindowHeight] = useState(600);

  // Placeholder wallpapers - replace with actual artwork paths
  const wallpapers = [
    { id: 'default', name: 'Default', color: 'bg-zinc-900' },
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-900' },
    { id: 'purple', name: 'Purple Haze', color: 'bg-purple-900' },
    { id: 'green', name: 'Forest Green', color: 'bg-green-900' },
  ];

  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Settings</h1>
        
        <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette size={20} />
              Theme Preferences
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="w-4 h-4 text-zinc-600"
                />
                <span className="text-zinc-900 dark:text-white">Light</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="w-4 h-4 text-zinc-600"
                />
                <span className="text-zinc-900 dark:text-white">Dark</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === 'system'}
                  onChange={() => setTheme('system')}
                  className="w-4 h-4 text-zinc-600"
                />
                <span className="text-zinc-900 dark:text-white">System</span>
              </label>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Wallpaper
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {wallpapers.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  className={`p-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors ${wallpaper.color}`}
                >
                  <div className="text-sm font-medium text-white">{wallpaper.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
              More wallpapers coming soon. Custom artwork selection will be available.
            </p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Monitor size={20} />
              Default Window Size
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Width: {defaultWindowWidth}px
                </label>
                <input
                  type="range"
                  min="400"
                  max="1600"
                  step="50"
                  value={defaultWindowWidth}
                  onChange={(e) => setDefaultWindowWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Height: {defaultWindowHeight}px
                </label>
                <input
                  type="range"
                  min="300"
                  max="1200"
                  step="50"
                  value={defaultWindowHeight}
                  onChange={(e) => setDefaultWindowHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This setting will apply to new windows. Existing windows keep their current size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

