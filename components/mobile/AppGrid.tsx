"use client";

import React from 'react';
import type { Content } from '@/app/data/content';
import { AppIcon } from './AppIcon';
import { getContentByCategory } from '@/app/data/content';

interface AppGridProps {
  content: Content[];
  onOpenItem: (content: Content) => void;
}

export function AppGrid({ content, onOpenItem }: AppGridProps) {
  // Group content by category
  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <div className="p-4 space-y-6 overflow-auto">
      {Object.entries(groupedContent).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs uppercase text-zinc-500 dark:text-zinc-500 font-semibold mb-3 px-2">
            {category}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <AppIcon
                key={item.id}
                content={item}
                onClick={() => onOpenItem(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

