"use client";

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { getAllContent, type Category, type Content } from '@/app/data/content';

interface RightPanelProps {
  onOpenItem: (content: Content) => void;
}

export function RightPanel({ onOpenItem }: RightPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const allContent = getAllContent();

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<Category>();
    allContent.forEach(item => categorySet.add(item.category));
    return Array.from(categorySet).sort();
  }, [allContent]);

  // Filter content by search query
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return allContent;
    const query = searchQuery.toLowerCase();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [allContent, searchQuery]);

  // Group filtered content by category
  const groupedContent = useMemo(() => {
    const grouped: Record<string, Content[]> = {};
    filteredContent.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredContent]);

  // Art gallery routes
  const artGalleries = [
    { id: 'art-digital-art', title: 'Digital Art', route: '/art-gallery/digital-art' },
    { id: 'art-paintings', title: 'Paintings', route: '/art-gallery/paintings' },
    { id: 'art-sketches', title: 'Sketches', route: '/art-gallery/sketches' },
    { id: 'art-lefthanded', title: 'Left-Handed Art', route: '/art-gallery/lefthanded' },
    { id: 'art-miscellaneous', title: 'Miscellaneous', route: '/art-gallery/miscellaneous' },
    { id: 'art-notesappart', title: 'Notes App Art', route: '/art-gallery/notesappart' },
  ];

  // Find art gallery content items
  const artGalleryContent = useMemo(() => {
    return artGalleries.map(gallery => {
      const content = allContent.find(item => item.id === gallery.id);
      return content ? { ...gallery, content } : null;
    }).filter((item): item is typeof artGalleries[0] & { content: Content } => item !== null);
  }, [allContent]);

  return (
    <div 
      className="h-full w-full bg-[rgb(var(--bg-desktop))] flex flex-col overflow-hidden" 
      style={{ 
        overflowX: 'hidden',
        touchAction: 'pan-y',
        overscrollBehaviorX: 'contain',
      }}
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-[rgb(var(--border-window))] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-secondary))]" size={20} />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded-lg text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-nickel))]"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden pb-20"
        style={{
          overflowX: 'hidden',
          touchAction: 'pan-y',
          overscrollBehaviorX: 'contain',
        }}
      >
        {/* Apps by Category */}
        <div className="p-4 space-y-6">
          {categories.map(category => {
            const items = groupedContent[category] || [];
            if (items.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-sm uppercase text-[rgb(var(--text-secondary))] font-semibold mb-3 px-2">
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
            );
          })}
        </div>

        {/* Art Gallery Controls */}
        <div className="p-4 border-t border-[rgb(var(--border-window))] mt-6">
          <h3 className="text-sm uppercase text-[rgb(var(--text-secondary))] font-semibold mb-4 px-2">
            Art Galleries
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {artGalleryContent.map((gallery) => (
              <button
                key={gallery.id}
                onClick={() => onOpenItem(gallery.content)}
                className="p-4 bg-[rgb(var(--bg-window))] border border-[rgb(var(--border-window))] rounded-lg hover:bg-[rgb(var(--bg-button-hover))] transition-colors text-left"
              >
                <div className="font-medium text-[rgb(var(--text-primary))] text-sm">
                  {gallery.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

