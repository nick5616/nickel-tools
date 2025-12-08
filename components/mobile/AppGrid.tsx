"use client";

import React from 'react';
import type { Content } from '@/app/data/content';
import { AppIcon } from './AppIcon';

interface AppGridProps {
  content: Content[];
  onOpenItem: (content: Content) => void;
}

export function AppGrid({ content, onOpenItem }: AppGridProps) {
  return (
    <div className="p-4 overflow-auto">
      <div className="grid grid-cols-3 gap-4">
        {content.map((item) => (
          <AppIcon
            key={item.id}
            content={item}
            onClick={() => onOpenItem(item)}
          />
        ))}
      </div>
    </div>
  );
}

