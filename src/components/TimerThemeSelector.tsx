"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimerThemeDemo from './TimerThemeDemo';

export interface TimerTheme {
  id: string;
  name: string;
  progressColor: string;
  backgroundColor: string;
  textColor: string;
  digitBgColor: string;
}

export const timerThemes: TimerTheme[] = [
  {
    id: 'default',
    name: 'Default',
    progressColor: 'text-indigo-600 dark:text-indigo-500',
    backgroundColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    progressColor: 'text-black dark:text-white',
    backgroundColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    progressColor: 'text-gradient-to-r from-purple-500 to-pink-500',
    backgroundColor: 'bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900',
    textColor: 'text-purple-800 dark:text-purple-200',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'focus',
    name: 'Focus',
    progressColor: 'text-rose-600 dark:text-rose-500',
    backgroundColor: 'bg-slate-200 dark:bg-slate-800',
    textColor: 'text-slate-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  },
  {
    id: 'nature',
    name: 'Nature',
    progressColor: 'text-emerald-600 dark:text-emerald-500',
    backgroundColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    digitBgColor: 'bg-transparent'
  }
];

interface TimerThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (theme: TimerTheme) => void;
}

export default function TimerThemeSelector({
  currentThemeId,
  onThemeChange
}: TimerThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const selectedTheme = timerThemes.find(theme => theme.id === currentThemeId) || timerThemes[0];

  return (
    <div className="relative">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300">Timer Theme</span>
        </button>

        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div 
              className="absolute mt-1 z-40 right-0 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Theme
              </div>
              <TimerThemeDemo theme={selectedTheme} />
              <div className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                {selectedTheme.name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="absolute z-40 mt-2 w-64 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Timer Theme</h3>
              </div>
              
              <div className="p-2">
                {timerThemes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${
                      theme.id === currentThemeId 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      onThemeChange(theme);
                      setIsOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="mr-2">
                        <TimerThemeDemo theme={theme} />
                      </div>
                      <span>{theme.name}</span>
                      
                      {theme.id === currentThemeId && (
                        <svg className="ml-auto h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 