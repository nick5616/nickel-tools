"use client";

import React from 'react';
import type { Content, Category } from '@/app/data/content';
import { getCategoryIcon } from '@/app/data/content';
import { Favicon } from './Favicon';
import {
  FileText,
  Gamepad2,
  Layers,
  BookOpen,
  Users,
  Palette,
  Cpu,
  Music,
  Brain,
  Video,
} from 'lucide-react';

interface IconRendererProps {
  content: Content;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconSizeMap = {
  sm: { class: 'w-4 h-4', pixels: 16 },
  md: { class: 'w-6 h-6', pixels: 24 },
  lg: { class: 'w-8 h-8', pixels: 32 },
};

const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'resume-builder': FileText,
  'portfolio': Gamepad2,
  'tierlistify': Layers,
  'videogamequest': BookOpen,
  'friendex': Users,
  'color-engine': Palette,
  'choice-engine': Cpu,
  'smart-piano': Music,
  'brains-games-gauntlet': Brain,
  'chaos': Video,
  'saucedog-art': Palette,
  'passionfruit': Layers,
};

export function IconRenderer({ content, size = 'md', className = '' }: IconRendererProps) {
  const sizeConfig = iconSizeMap[size];
  const sizeClass = sizeConfig.class;

  // For external links, use favicon
  if (content.type === 'external') {
    const fallback = (() => {
      const IconComponent = iconComponentMap[content.id];
      if (IconComponent) {
        return <IconComponent className={sizeClass} />;
      }
      const emoji = getCategoryIcon(content.category);
      return (
        <span className={`${sizeClass} flex items-center justify-center text-2xl`}>
          {emoji}
        </span>
      );
    })();

    return (
      <Favicon
        url={content.url}
        size={sizeConfig.pixels}
        className={className}
        fallback={fallback}
      />
    );
  }

  // For internal apps and other types, use the icon component map
  const IconComponent = iconComponentMap[content.id];
  if (IconComponent) {
    return <IconComponent className={`${sizeClass} ${className}`} />;
  }

  // Fallback to emoji based on category
  const emoji = getCategoryIcon(content.category);
  return (
    <span className={`${sizeClass} ${className} flex items-center justify-center text-2xl`}>
      {emoji}
    </span>
  );
}

