"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomThemeProps {
  onThemeChange: (colors: CustomThemeColors) => void;
  currentTheme: CustomThemeColors;
}

export interface CustomThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Predefined theme presets
const themePresets = [
  {
    name: 'Default',
    colors: {
      primary: '#6366f1', // Indigo
      secondary: '#10b981', // Emerald
      accent: '#f43f5e', // Rose
      background: '#ffffff', // White
      text: '#1f2937', // Gray-800
    }
  },
  {
    name: 'Dark',
    colors: {
      primary: '#818cf8', // Indigo-400
      secondary: '#34d399', // Emerald-400
      accent: '#fb7185', // Rose-400
      background: '#1f2937', // Gray-800
      text: '#f9fafb', // Gray-50
    }
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9', // Sky-500
      secondary: '#06b6d4', // Cyan-500
      accent: '#3b82f6', // Blue-500
      background: '#f0f9ff', // Sky-50
      text: '#0c4a6e', // Sky-900
    }
  },
  {
    name: 'Forest',
    colors: {
      primary: '#059669', // Emerald-600
      secondary: '#10b981', // Emerald-500
      accent: '#f59e0b', // Amber-500
      background: '#ecfdf5', // Emerald-50
      text: '#064e3b', // Emerald-900
    }
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#db2777', // Pink-600
      secondary: '#f59e0b', // Amber-500
      accent: '#ef4444', // Red-500
      background: '#fff1f2', // Rose-50
      text: '#881337', // Rose-900
    }
  },
  {
    name: 'Monochrome',
    colors: {
      primary: '#4b5563', // Gray-600
      secondary: '#9ca3af', // Gray-400
      accent: '#1f2937', // Gray-800
      background: '#f9fafb', // Gray-50
      text: '#111827', // Gray-900
    }
  },
];

export default function CustomThemeSelector({ onThemeChange, currentTheme }: CustomThemeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customTheme, setCustomTheme] = useState<CustomThemeColors>(currentTheme);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  
  // Update local state when props change
  useEffect(() => {
    setCustomTheme(currentTheme);
  }, [currentTheme]);
  
  // Apply theme change
  const applyTheme = (colors: CustomThemeColors) => {
    setCustomTheme(colors);
    onThemeChange(colors);
  };
  
  // Handle color input change
  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    const newTheme = { ...customTheme, [key]: value };
    setCustomTheme(newTheme);
  };
  
  // Apply custom theme
  const applyCustomTheme = () => {
    onThemeChange(customTheme);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex space-x-1">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTheme.secondary }} />
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTheme.accent }} />
        </div>
        <span>Custom Theme</span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'presets'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } cursor-pointer`}
                onClick={() => setActiveTab('presets')}
              >
                Presets
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'custom'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } cursor-pointer`}
                onClick={() => setActiveTab('custom')}
              >
                Custom
              </button>
            </div>
            
            <div className="p-4">
              {activeTab === 'presets' ? (
                <div className="grid grid-cols-2 gap-2">
                  {themePresets.map((preset, index) => (
                    <motion.button
                      key={preset.name}
                      className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyTheme(preset.colors)}
                    >
                      <div className="flex space-x-1 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {preset.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Primary Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-8 h-8 rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-8 h-8 rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Accent Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-8 h-8 rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Background Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-8 h-8 rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Text Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={customTheme.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="w-8 h-8 rounded-l-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={applyCustomTheme}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      Apply Theme
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
