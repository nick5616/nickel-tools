"use client";

import React from 'react';

export function StatusBar() {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 dark:bg-zinc-900 px-4 py-2 flex items-center justify-between text-xs text-zinc-300">
      <span>{time}</span>
      <div className="flex items-center gap-2">
        <span>4G</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

