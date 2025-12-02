"use client";

import React from 'react';
import type { Content, Category } from '@/app/data/content';
import { getCategoryIcon } from '@/app/data/content';
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
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
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
  const IconComponent = iconComponentMap[content.id];
  const sizeClass = iconSizeMap[size];

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

