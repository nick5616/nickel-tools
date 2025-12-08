"use client";

import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Wifi, Signal } from 'lucide-react';

interface BatteryInfo {
  level: number;
  charging: boolean;
}

export function StatusBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }));
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [hasBatteryAPI, setHasBatteryAPI] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Battery API detection
  useEffect(() => {
    const checkBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setHasBatteryAPI(true);
          
          const updateBattery = () => {
            setBatteryInfo({
              level: Math.round(battery.level * 100),
              charging: battery.charging
            });
          };

          updateBattery();
          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('levelchange', updateBattery);

          return () => {
            battery.removeEventListener('chargingchange', updateBattery);
            battery.removeEventListener('levelchange', updateBattery);
          };
        } catch (error) {
          console.error('Battery API error:', error);
          setHasBatteryAPI(false);
        }
      } else {
        setHasBatteryAPI(false);
      }
    };

    checkBattery();
  }, []);

  // Network status
  useEffect(() => {
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getBatteryIcon = () => {
    if (!batteryInfo) return null;
    
    const { level, charging } = batteryInfo;
    const BatteryIcon = charging ? BatteryCharging : Battery;
    
    // Determine battery level for visual representation
    let fillLevel = 0;
    if (level > 75) fillLevel = 4;
    else if (level > 50) fillLevel = 3;
    else if (level > 25) fillLevel = 2;
    else if (level > 10) fillLevel = 1;
    else fillLevel = 0;

    return (
      <div className="flex items-center gap-1">
        <BatteryIcon 
          size={16} 
          className={charging ? 'text-green-400' : level < 20 ? 'text-red-400' : 'text-[rgb(var(--text-secondary))]'}
        />
        <span className="text-[rgb(var(--text-secondary))] text-xs">{level}%</span>
      </div>
    );
  };

  const getFallbackIndicator = () => {
    if (networkStatus === 'online') {
      return (
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-[rgb(var(--text-secondary))]" />
          <span className="text-[rgb(var(--text-secondary))] text-xs">Online</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Signal size={14} className="text-[rgb(var(--text-secondary))]" />
          <span className="text-[rgb(var(--text-secondary))] text-xs">Offline</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-menubar))] px-4 py-2 flex items-center justify-between text-xs text-[rgb(var(--text-menubar))]">
      <span>{time}</span>
      <div className="flex items-center gap-3">
        {hasBatteryAPI && batteryInfo ? getBatteryIcon() : getFallbackIndicator()}
      </div>
    </div>
  );
}

