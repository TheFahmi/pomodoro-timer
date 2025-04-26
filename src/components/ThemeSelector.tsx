"use client";

import { useState, useEffect } from 'react';

export type Theme = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgClass: string;
};

type ThemeSelectorProps = {
  onThemeChange: (theme: Theme) => void;
  currentThemeId: string;
};

const AVAILABLE_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    primaryColor: 'bg-indigo-600',
    secondaryColor: 'bg-rose-600',
    accentColor: 'bg-emerald-600',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: 'bg-blue-600',
    secondaryColor: 'bg-cyan-600',
    accentColor: 'bg-teal-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'forest',
    name: 'Forest',
    primaryColor: 'bg-green-600',
    secondaryColor: 'bg-emerald-600',
    accentColor: 'bg-lime-600',
    bgClass: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primaryColor: 'bg-orange-600',
    secondaryColor: 'bg-amber-600',
    accentColor: 'bg-yellow-600',
    bgClass: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: 'bg-purple-600',
    secondaryColor: 'bg-violet-600',
    accentColor: 'bg-fuchsia-600',
    bgClass: 'bg-purple-50 dark:bg-purple-950',
  },
];

export default function ThemeSelector({ onThemeChange, currentThemeId }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(
    AVAILABLE_THEMES.find(theme => theme.id === currentThemeId) || AVAILABLE_THEMES[0]
  );

  // Update local state when prop changes
  useEffect(() => {
    const theme = AVAILABLE_THEMES.find(theme => theme.id === currentThemeId);
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [currentThemeId]);

  const handleThemeSelect = (themeId: string) => {
    const theme = AVAILABLE_THEMES.find(theme => theme.id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      onThemeChange(theme);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
        Theme: {selectedTheme.name}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Select Theme
            </div>
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                  selectedTheme.id === theme.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  {selectedTheme.id === theme.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className={selectedTheme.id === theme.id ? 'ml-2' : 'ml-6'}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${theme.primaryColor} mr-1`}></div>
                      <div className={`w-3 h-3 rounded-full ${theme.secondaryColor} mr-1`}></div>
                      <div className={`w-3 h-3 rounded-full ${theme.accentColor} mr-2`}></div>
                      {theme.name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
