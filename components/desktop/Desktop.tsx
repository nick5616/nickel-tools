"use client";

import React from 'react';
import type { Content } from '@/app/data/content';
import { DesktopIcon } from './DesktopIcon';
import { getContentByCategory } from '@/app/data/content';

interface DesktopProps {
  content: Content[];
  onOpenContent: (content: Content) => void;
  onContextMenu?: (e: React.MouseEvent, content: Content) => void;
}

// Default positions for desktop icons (organized by category)
const getDefaultIconPositions = (content: Content[]): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();
  const categoryColumns: Record<string, number> = {};
  const categoryRows: Record<string, number> = {};
  
  const columnWidth = 200;
  const rowHeight = 150;
  const startX = 50;
  const startY = 100;

  content.forEach((item) => {
    const category = item.category;
    if (!categoryColumns[category]) {
      categoryColumns[category] = Object.keys(categoryColumns).length;
      categoryRows[category] = 0;
    }

    const col = categoryColumns[category];
    const row = categoryRows[category]!;
    
    positions.set(item.id, {
      x: startX + col * columnWidth,
      y: startY + row * rowHeight,
    });

    categoryRows[category] = (categoryRows[category] || 0) + 1;
  });

  return positions;
};

export function Desktop({ content, onOpenContent, onContextMenu }: DesktopProps) {
  const iconPositions = getDefaultIconPositions(content);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {content.map((item) => {
        const position = iconPositions.get(item.id) || { x: 50, y: 100 };
        return (
          <DesktopIcon
            key={item.id}
            content={item}
            position={position}
            onDoubleClick={onOpenContent}
            onContextMenu={onContextMenu}
          />
        );
      })}
    </div>
  );
}

