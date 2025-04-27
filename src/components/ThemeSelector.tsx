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
  };

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">App Theme</div>
      
      <div className="grid grid-cols-1 gap-1">
        {AVAILABLE_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`flex items-center justify-start px-2 py-1 text-xs rounded ${
              selectedTheme.id === theme.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              {selectedTheme.id === theme.id && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <div className={selectedTheme.id === theme.id ? 'flex items-center' : 'flex items-center ml-4'}>
                <div className={`w-2 h-2 rounded-full ${theme.primaryColor} mr-1`}></div>
                <div className={`w-2 h-2 rounded-full ${theme.secondaryColor} mr-1`}></div>
                <div className={`w-2 h-2 rounded-full ${theme.accentColor} mr-1`}></div>
                <span className="text-xs">{theme.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
