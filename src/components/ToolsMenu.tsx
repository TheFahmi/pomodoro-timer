"use client";

import { useState, useRef, useEffect } from 'react';
import FocusMode, { FocusModeOptions } from './FocusMode';
import NotificationSettings from './NotificationSettings';
import BackgroundMusic from './BackgroundMusic';
import ZenMode from './ZenMode';
import CustomThemeSelector, { CustomThemeColors } from './CustomThemeSelector';
import CalendarIntegration from './CalendarIntegration';
import ExcelExport from './ExcelExport';

type ToolsMenuProps = {
  // Focus Mode
  onFocusModeChange: (isEnabled: boolean, options?: FocusModeOptions) => void;
  onFocusModeOptionsChange?: (options: FocusModeOptions) => void;
  isFocusModeEnabled: boolean;
  currentFocusModeOptions?: FocusModeOptions;

  // Notifications
  onNotificationChange: (isEnabled: boolean) => void;
  isNotificationEnabled: boolean;

  // Background Music
  onMusicChange: (music: string | null) => void;
  currentMusic: string | null;
  isMusicPlaying: boolean;
  onMusicPlayingChange: (isPlaying: boolean) => void;

  // Zen Mode
  isZenModeActive?: boolean;
  onZenModeToggle?: (isActive: boolean) => void;
  remainingTime?: number;
  totalTime?: number;

  // Custom Theme
  customThemeColors?: CustomThemeColors;
  onCustomThemeChange?: (colors: CustomThemeColors) => void;

  // Calendar Integration
  onCalendarEventSelect?: (eventTitle: string) => void;

  // Excel Export
  tasks?: any[];
  sessionHistory?: any[];
  pomodoroTime?: number;
  shortBreakTime?: number;
  longBreakTime?: number;
};

export default function ToolsMenu({
  // Focus Mode
  onFocusModeChange,
  onFocusModeOptionsChange,
  isFocusModeEnabled,
  currentFocusModeOptions,

  // Notifications
  onNotificationChange,
  isNotificationEnabled,

  // Background Music
  onMusicChange,
  currentMusic,
  isMusicPlaying,
  onMusicPlayingChange,

  // Zen Mode
  isZenModeActive = false,
  onZenModeToggle,
  remainingTime = 0,
  totalTime = 0,

  // Custom Theme
  customThemeColors,
  onCustomThemeChange,

  // Calendar Integration
  onCalendarEventSelect,

  // Excel Export
  tasks = [],
  sessionHistory = [],
  pomodoroTime = 0,
  shortBreakTime = 0,
  longBreakTime = 0
}: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle options change separately
  const handleFocusModeOptionsChange = (options: FocusModeOptions) => {
    if (onFocusModeOptionsChange) {
      onFocusModeOptionsChange(options);
    } else {
      // Fallback to using the combined handler
      onFocusModeChange(isFocusModeEnabled, options);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Tools
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Focus Mode</h3>
              <FocusMode
                isFocusModeEnabled={isFocusModeEnabled}
                onFocusModeChange={onFocusModeChange}
                currentOptions={currentFocusModeOptions}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Zen Mode</h3>
              <ZenMode
                isActive={isZenModeActive}
                onToggle={onZenModeToggle || (() => {})}
                remainingTime={remainingTime}
                totalTime={totalTime}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Custom Theme</h3>
              <CustomThemeSelector
                onThemeChange={onCustomThemeChange || (() => {})}
                currentTheme={customThemeColors || {
                  primary: '#6366f1',
                  secondary: '#10b981',
                  accent: '#f43f5e',
                  background: '#ffffff',
                  text: '#1f2937',
                }}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Calendar Integration</h3>
              <CalendarIntegration
                onEventSelect={onCalendarEventSelect || (() => {})}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notifications</h3>
              <NotificationSettings
                onNotificationChange={(isEnabled) => {
                  onNotificationChange(isEnabled);
                }}
                isNotificationEnabled={isNotificationEnabled}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Background Music</h3>
              <BackgroundMusic
                onMusicChange={onMusicChange}
                currentMusic={currentMusic}
                isPlaying={isMusicPlaying}
                onPlayingChange={onMusicPlayingChange}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Export to Excel</h3>
              <ExcelExport
                tasks={tasks}
                sessionHistory={sessionHistory}
                pomodoroTime={pomodoroTime}
                shortBreakTime={shortBreakTime}
                longBreakTime={longBreakTime}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
