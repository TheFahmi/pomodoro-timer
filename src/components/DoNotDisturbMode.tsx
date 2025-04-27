"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DoNotDisturbOptions = {
  enableDND: boolean;
  blockWebsites: boolean;
  blockedSites: string[];
  autoEnable: boolean;
  showNotification: boolean;
};

type DoNotDisturbProps = {
  onDNDChange: (isEnabled: boolean, options?: DoNotDisturbOptions) => void;
  onOptionsChange?: (options: DoNotDisturbOptions) => void;
  isDNDEnabled: boolean;
  isPomodoro: boolean;
  currentOptions?: DoNotDisturbOptions;
};

const defaultOptions: DoNotDisturbOptions = {
  enableDND: true,
  blockWebsites: true,
  blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'reddit.com'],
  autoEnable: true,
  showNotification: true
};

export default function DoNotDisturbMode({
  onDNDChange,
  onOptionsChange,
  isDNDEnabled,
  isPomodoro,
  currentOptions
}: DoNotDisturbProps) {
  const [isEnabled, setIsEnabled] = useState(isDNDEnabled);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<DoNotDisturbOptions>(currentOptions || defaultOptions);
  const [newSite, setNewSite] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    setIsEnabled(isDNDEnabled);
  }, [isDNDEnabled]);

  // Update options when prop changes
  useEffect(() => {
    if (currentOptions) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  // Auto-enable DND when starting a Pomodoro session
  useEffect(() => {
    if (isPomodoro && options.autoEnable && !isEnabled) {
      toggleDND(true);
    } else if (!isPomodoro && options.autoEnable && isEnabled) {
      toggleDND(false);
    }
  }, [isPomodoro, options.autoEnable]);

  const toggleDND = (value?: boolean) => {
    const newState = value !== undefined ? value : !isEnabled;
    setIsEnabled(newState);
    onDNDChange(newState, options);

    if (newState) {
      enableDNDMode();
      if (options.blockWebsites) {
        blockDistractions();
      }
      if (options.showNotification) {
        showDNDNotification(true);
      }
    } else {
      disableDNDMode();
      if (options.blockWebsites) {
        unblockDistractions();
      }
      if (options.showNotification) {
        showDNDNotification(false);
      }
    }
  };

  const updateOption = (
    key: keyof DoNotDisturbOptions,
    value: DoNotDisturbOptions[keyof DoNotDisturbOptions]
  ) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);

    // Call appropriate handler for options changes
    if (onOptionsChange) {
      onOptionsChange(newOptions);
    } else {
      // Fallback to the combined handler
      onDNDChange(isEnabled, newOptions);
    }

    // Apply changes immediately if DND is currently enabled
    if (isEnabled) {
      if (key === 'enableDND') {
        if (value) enableDNDMode(); else disableDNDMode();
      }
      if (key === 'blockWebsites') {
        if (value) blockDistractions(); else unblockDistractions();
      }
    }
  };

  const enableDNDMode = () => {
    // Request notification permission if needed
    if (typeof window !== 'undefined' && 'Notification' in window && options.enableDND) {
      // Try to use the Notifications API to request DND permission
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // Try to use the mediaSession API to control media
      if ('mediaSession' in navigator) {
        // Set playback state to paused to minimize distractions
        navigator.mediaSession.playbackState = 'paused';
      }
    }

    // In a real implementation, you would use the OS-specific APIs 
    // like Windows notification API or macOS NSUserNotification
    console.log('DND Mode enabled');
  };

  const disableDNDMode = () => {
    // Restore normal notification settings
    console.log('DND Mode disabled');
  };

  const blockDistractions = () => {
    // In a production app, this would connect to a browser extension or system service
    // As a simple demo, we'll just log the sites being blocked
    console.log('Blocking distracting websites:', options.blockedSites);
    
    // For demo purposes, we can store the list in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroBlockedSites', JSON.stringify(options.blockedSites));
    }
  };

  const unblockDistractions = () => {
    console.log('Unblocking websites');
    // Remove the block list from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoroBlockedSites');
    }
  };

  const showDNDNotification = (enabled: boolean) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        enabled ? "Do Not Disturb Mode Enabled" : "Do Not Disturb Mode Disabled", 
        {
          body: enabled 
            ? "Stay focused! Distractions have been minimized." 
            : "Break time! Normal notifications have been restored.",
          icon: '/icons/icon-192.png',
          silent: true
        }
      );
      setTimeout(() => notification.close(), 3000);
    }
  };

  const addBlockedSite = () => {
    if (!newSite) return;
    
    // Format the site (ensure it's a domain)
    let formattedSite = newSite.trim().toLowerCase();
    // Remove http/https protocol if present
    formattedSite = formattedSite.replace(/^https?:\/\//, '');
    // Remove paths and query parameters, keep only domain
    formattedSite = formattedSite.split('/')[0];
    
    if (formattedSite && !options.blockedSites.includes(formattedSite)) {
      const newBlockedSites = [...options.blockedSites, formattedSite];
      updateOption('blockedSites', newBlockedSites);
      setNewSite('');
    }
  };

  const removeBlockedSite = (site: string) => {
    const newBlockedSites = options.blockedSites.filter(s => s !== site);
    updateOption('blockedSites', newBlockedSites);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <button
          onClick={() => toggleDND()}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer min-w-[180px] justify-center ${
            isEnabled
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title={isEnabled ? "Disable Do Not Disturb" : "Enable Do Not Disturb"}
        >
          {isEnabled ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              DND Mode On
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              DND Mode Off
            </>
          )}
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          title="Do Not Disturb options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 p-4 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Do Not Disturb Options</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="enableDND" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Block Notifications
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="enableDND"
                    checked={options.enableDND}
                    onChange={(e) => updateOption('enableDND', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.enableDND ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.enableDND ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="blockWebsites" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Block Distracting Sites
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="blockWebsites"
                    checked={options.blockWebsites}
                    onChange={(e) => updateOption('blockWebsites', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.blockWebsites ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.blockWebsites ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="autoEnable" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Auto-enable for Pomodoro
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="autoEnable"
                    checked={options.autoEnable}
                    onChange={(e) => updateOption('autoEnable', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.autoEnable ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.autoEnable ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="showNotification" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Show Status Notification
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="showNotification"
                    checked={options.showNotification}
                    onChange={(e) => updateOption('showNotification', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.showNotification ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.showNotification ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              {options.blockWebsites && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Blocked Websites
                  </label>
                  
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={newSite}
                      onChange={(e) => setNewSite(e.target.value)}
                      placeholder="e.g., facebook.com"
                      className="flex-grow px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={addBlockedSite}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-r-md hover:bg-red-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {options.blockedSites.length === 0 ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No websites added to block list
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {options.blockedSites.map((site, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                            <span className="text-gray-800 dark:text-gray-200">{site}</span>
                            <button
                              onClick={() => removeBlockedSite(site)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove site"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Do Not Disturb mode blocks notifications and distracting websites to help you stay focused during Pomodoro sessions.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
