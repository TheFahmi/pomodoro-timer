"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FocusModeProps = {
  onFocusModeChange: (isEnabled: boolean, options?: FocusModeOptions) => void;
  onOptionsChange?: (options: FocusModeOptions) => void;
  isFocusModeEnabled: boolean;
  currentOptions?: FocusModeOptions;
};

export type FocusModeOptions = {
  darkTheme: boolean;
  hideTaskList: boolean;
  hideControls: boolean;
  fullscreen: boolean;
};

const defaultOptions: FocusModeOptions = {
  darkTheme: true,
  hideTaskList: true,
  hideControls: false,
  fullscreen: false,
};

export default function FocusMode({
  onFocusModeChange,
  onOptionsChange,
  isFocusModeEnabled,
  currentOptions
}: FocusModeProps) {
  const [isEnabled, setIsEnabled] = useState(isFocusModeEnabled);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<FocusModeOptions>(currentOptions || defaultOptions);

  // Update local state when prop changes
  useEffect(() => {
    setIsEnabled(isFocusModeEnabled);
  }, [isFocusModeEnabled]);

  // Update options when prop changes
  useEffect(() => {
    if (currentOptions) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  const toggleFocusMode = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onFocusModeChange(newState, options);

    // If turning on focus mode, try to request fullscreen if that option is enabled
    if (newState && options.fullscreen) {
      requestFullscreen();
    } else if (!newState && document.fullscreenElement) {
      // Exit fullscreen when turning off focus mode
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  const updateOption = (key: keyof FocusModeOptions, value: boolean) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);

    // Call appropriate handler for options changes
    if (onOptionsChange) {
      onOptionsChange(newOptions);
    } else {
      // Fallback to the combined handler
      onFocusModeChange(isEnabled, newOptions);
    }

    // Handle fullscreen option change immediately if focus mode is enabled
    if (isEnabled && key === 'fullscreen') {
      if (value) {
        requestFullscreen();
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    }
  };

  const requestFullscreen = () => {
    const docEl = document.documentElement;

    if (!document.fullscreenElement && docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <button
          onClick={toggleFocusMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer min-w-[180px] justify-center ${
            isEnabled
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title={isEnabled ? "Exit focus mode" : "Enter focus mode"}
        >
          {isEnabled ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Focus Mode On
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
              Focus Mode Off
            </>
          )}
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          title="Focus mode options"
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
            className="absolute right-0 mt-2 w-51 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 p-4 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Focus Mode Options</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="darkTheme" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Dark Theme
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="darkTheme"
                    checked={options.darkTheme}
                    onChange={(e) => updateOption('darkTheme', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.darkTheme ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.darkTheme ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="hideTaskList" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Hide Task List
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="hideTaskList"
                    checked={options.hideTaskList}
                    onChange={(e) => updateOption('hideTaskList', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.hideTaskList ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.hideTaskList ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="hideControls" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Minimal Controls
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="hideControls"
                    checked={options.hideControls}
                    onChange={(e) => updateOption('hideControls', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.hideControls ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.hideControls ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="fullscreen" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Fullscreen Mode
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="fullscreen"
                    checked={options.fullscreen}
                    onChange={(e) => updateOption('fullscreen', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${options.fullscreen ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${options.fullscreen ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Focus mode helps you concentrate by removing distractions and providing a cleaner interface.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
