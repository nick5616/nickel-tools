"use client";

import { create } from 'zustand';
import type { Content } from '../data/content';

export interface WindowState {
  id: string;
  content: Content;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
}

interface AppState {
  windows: WindowState[];
  openWindow: (content: Content) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  getNextZIndex: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  windows: [],

  openWindow: (content) => {
    const existingWindow = get().windows.find(w => w.content.id === content.id);
    if (existingWindow) {
      // If window exists, focus it and un-minimize if minimized
      get().focusWindow(existingWindow.id);
      if (existingWindow.minimized) {
        get().minimizeWindow(existingWindow.id);
      }
      return;
    }

    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      content,
      position: { 
        x: 100 + get().windows.length * 30, 
        y: 100 + get().windows.length * 30 
      },
      size: { width: 800, height: 600 },
      zIndex: get().getNextZIndex(),
      minimized: false,
    };

    set({ windows: [...get().windows, newWindow] });
  },

  closeWindow: (id) => {
    set({ windows: get().windows.filter(w => w.id !== id) });
  },

  minimizeWindow: (id) => {
    set({
      windows: get().windows.map(w => 
        w.id === id ? { ...w, minimized: !w.minimized } : w
      )
    });
  },

  focusWindow: (id) => {
    const maxZ = Math.max(...get().windows.map(w => w.zIndex), 0);
    set({
      windows: get().windows.map(w =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      )
    });
  },

  updateWindowPosition: (id, position) => {
    set({
      windows: get().windows.map(w =>
        w.id === id ? { ...w, position } : w
      )
    });
  },

  updateWindowSize: (id, size) => {
    set({
      windows: get().windows.map(w =>
        w.id === id ? { ...w, size } : w
      )
    });
  },

  getNextZIndex: () => {
    const maxZ = Math.max(...get().windows.map(w => w.zIndex), 20);
    return maxZ + 1;
  },
}));

