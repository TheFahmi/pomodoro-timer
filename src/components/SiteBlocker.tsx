"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SiteBlocker() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [currentSite, setCurrentSite] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [, setBlockedSites] = useState<string[]>([]);
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Check if DND mode is enabled and website blocking is on
    const isDNDEnabled = localStorage.getItem('pomodoroDND') === 'true';
    if (!isDNDEnabled) return;

    // Load DND options
    const dndOptionsStr = localStorage.getItem('pomodoroDNDOptions');
    if (!dndOptionsStr) return;

    try {
      const dndOptions = JSON.parse(dndOptionsStr);
      if (!dndOptions.blockWebsites) return;
      
      // Load blocked sites list
      setBlockedSites(dndOptions.blockedSites || []);
      
      // Check if current site is in the blocklist
      const hostname = window.location.hostname;
      const isCurrentSiteBlocked = dndOptions.blockedSites.some((site: string) => 
        hostname === site || hostname.endsWith('.' + site)
      );
      
      if (isCurrentSiteBlocked) {
        setIsBlocked(true);
        setCurrentSite(hostname);
        
        // Check how much time is left in the current Pomodoro
        const timeLeft = parseInt(localStorage.getItem('pomodoroTimeLeft') || '0', 10);
        setRemainingTime(timeLeft);
        
        // Set up timer to update the remaining time
        const timer = setInterval(() => {
          const newTimeLeft = parseInt(localStorage.getItem('pomodoroTimeLeft') || '0', 10);
          setRemainingTime(newTimeLeft);
          
          // Check if DND is still active
          const isDNDStillEnabled = localStorage.getItem('pomodoroDND') === 'true';
          if (!isDNDStillEnabled) {
            setIsBlocked(false);
            clearInterval(timer);
          }
          
          // Check if the current timer is now a break timer
          const currentTimer = localStorage.getItem('pomodoroCurrentTimer');
          if (currentTimer !== 'pomodoro') {
            setIsBlocked(false);
            clearInterval(timer);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      }
    } catch (error) {
      console.error('Error parsing DND options:', error);
    }
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isBlocked) return null;
  
  return (
    <div className="fixed inset-0 bg-red-50 dark:bg-red-900/20 backdrop-blur-lg z-50 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: 0 }}
            className="mx-auto mb-6 bg-red-100 dark:bg-red-900/50 w-20 h-20 rounded-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Site Blocked</h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <span className="font-semibold text-red-600 dark:text-red-400">{currentSite}</span> is blocked during Pomodoro sessions.
          </p>
          
          <div className="mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Time remaining in your focus session:</p>
            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(remainingTime)}
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
            >
              Go Back
            </button>
            
            <button
              onClick={() => setIsBlocked(false)}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Override Block (Not Recommended)
            </button>
          </div>
          
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            This site is blocked because you enabled Do Not Disturb mode for your Pomodoro Timer.
            Stay focused and avoid distractions during your productive time!
          </p>
        </div>
      </motion.div>
    </div>
  );
} 