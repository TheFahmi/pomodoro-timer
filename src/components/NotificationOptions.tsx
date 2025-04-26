"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NotificationOptionsProps {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

export default function NotificationOptions({ isEnabled, onToggle }: NotificationOptionsProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        
        if (permission === 'granted') {
          onToggle(true);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const handleToggle = () => {
    if (permissionState === 'granted') {
      onToggle(!isEnabled);
    } else if (permissionState === 'default') {
      requestPermission();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notifications</h3>
      
      {permissionState === 'unsupported' ? (
        <div className="text-sm text-amber-600 dark:text-amber-400">
          Notifications are not supported in your browser.
        </div>
      ) : permissionState === 'denied' ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          Notification permission was denied. Please enable notifications in your browser settings.
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isEnabled ? 'Notifications are enabled' : 'Enable notifications'}
          </span>
          
          <motion.button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer ${
              isEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">Toggle notifications</span>
            <motion.span
              className="inline-block h-4 w-4 transform rounded-full bg-white"
              initial={false}
              animate={{ 
                x: isEnabled ? 14 : 2
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      )}
      
      {permissionState === 'granted' && isEnabled && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            You'll receive notifications when:
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
            <li>A timer completes</li>
            <li>It's time to take a break</li>
            <li>It's time to get back to work</li>
          </ul>
        </div>
      )}
    </div>
  );
}
