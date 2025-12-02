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

export type ViewFilter = 'all' | 'engineering' | 'music' | 'art' | 'immersive-web' | 'social-tools' | 'tools-only';
export type SortMethod = 'date' | 'category' | 'name';

interface MenuState {
  viewFilter: ViewFilter;
  sortMethod: SortMethod;
  openMenus: {
    niIcon: boolean;
    view: boolean;
    art: boolean;
    tools: boolean;
  };
}

interface AppState {
  windows: WindowState[];
  menu: MenuState;
  openWindow: (content: Content) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  getNextZIndex: () => number;
  setViewFilter: (filter: ViewFilter) => void;
  setSortMethod: (method: SortMethod) => void;
  toggleMenu: (menu: keyof MenuState['openMenus']) => void;
  closeAllMenus: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  windows: [],
  menu: {
    viewFilter: 'all',
    sortMethod: 'category',
    openMenus: {
      niIcon: false,
      view: false,
      art: false,
      tools: false,
    },
  },

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

  setViewFilter: (filter) => {
    set({ menu: { ...get().menu, viewFilter: filter } });
    get().closeAllMenus();
  },

  setSortMethod: (method) => {
    set({ menu: { ...get().menu, sortMethod: method } });
    get().closeAllMenus();
  },

  toggleMenu: (menu) => {
    const currentState = get().menu.openMenus[menu];
    // Close all menus first
    const newOpenMenus = {
      niIcon: false,
      view: false,
      art: false,
      tools: false,
    };
    // Then toggle the clicked menu
    newOpenMenus[menu] = !currentState;
    set({ menu: { ...get().menu, openMenus: newOpenMenus } });
  },

  closeAllMenus: () => {
    set({
      menu: {
        ...get().menu,
        openMenus: {
          niIcon: false,
          view: false,
          art: false,
          tools: false,
        },
      },
    });
  },
}));

