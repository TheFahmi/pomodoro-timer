"use client";

import { useState, useRef, useEffect } from 'react';
import FocusMode, { FocusModeOptions } from './FocusMode';
import NotificationSettings from './NotificationSettings';
import BackgroundMusic from './BackgroundMusic';
import Link from 'next/link';
import CustomThemeSelector, { CustomThemeColors } from './CustomThemeSelector';
import CalendarIntegration from './CalendarIntegration';
import ExcelExport from './ExcelExport';
import TodoIntegration from './TodoIntegration';
import { Task } from './TaskList';
import { SessionHistory } from './PomodoroApp';

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

  // Task Import/Export
  onImportTasks?: (tasks: Task[]) => void;

  // Excel Export
  tasks?: Task[];
  sessionHistory?: SessionHistory[];
  pomodoroTime?: number;
  shortBreakTime?: number;
  longBreakTime?: number;

  // Notes
  onNotesToggle?: () => void;
  isNotesOpen?: boolean;
  
  // Settings
  onStatisticsClick?: () => void;
  onTimerSettingsClick?: () => void;
};

export default function ToolsMenu({
  // Focus Mode
  onFocusModeChange,
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
  remainingTime = 0,
  totalTime = 0,

  // Custom Theme
  customThemeColors,
  onCustomThemeChange,

  // Calendar Integration
  onCalendarEventSelect,

  // Task Import/Export
  onImportTasks,

  // Excel Export
  tasks = [],
  sessionHistory = [],
  pomodoroTime = 0,
  shortBreakTime = 0,
  longBreakTime = 0,

  // Notes
  onNotesToggle = () => {},
  isNotesOpen = false,
  
  // Settings
  onStatisticsClick = () => {},
  onTimerSettingsClick = () => {}
}: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isTodoistModalOpen, setIsTodoistModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveCategory('focus'); // Default to focus category when opening
    }
  };

  // Toggle category
  const toggleCategory = (category: string) => {
    setActiveCategory(prev => prev === category ? prev : category);
  };

  // Open Todoist modal
  const openTodoistModal = () => {
    setIsTodoistModalOpen(true);
    setIsOpen(false);
  };

  // Close Todoist modal
  const closeTodoistModal = () => {
    setIsTodoistModalOpen(false);
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

  // Categories and their icons
  const categories = [
    { 
      id: 'focus', 
      label: 'Focus',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'indigo'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'emerald'
    },
    {
      id: 'data',
      label: 'Data',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
        </svg>
      ),
      color: 'amber'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'blue'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="hidden sm:inline">Menu</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/30 backdrop-blur-sm" onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}>
          <div 
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Pomodoro Menu</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Navigation sidebar */}
            <div className="flex h-[calc(100%-64px)]">
              {/* Categories */}
              <div className="w-20 border-r border-gray-200 dark:border-gray-700 py-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex flex-col items-center justify-center w-full p-2 mb-1 transition-colors ${
                      activeCategory === category.id 
                        ? `text-${category.color}-600 dark:text-${category.color}-400`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-1 ${
                      activeCategory === category.id 
                        ? `bg-${category.color}-100 dark:bg-${category.color}-900/30`
                        : ''
                    }`}>
                      {category.icon}
                    </div>
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Content area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Focus Category */}
                {activeCategory === 'focus' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Focus Mode</h3>
                      <FocusMode
                        isFocusModeEnabled={isFocusModeEnabled}
                        onFocusModeChange={onFocusModeChange}
                        currentOptions={currentFocusModeOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Zen Mode</h3>
                      <Link href={`/zen?time=${remainingTime}&total=${totalTime}`}>
                        <button
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Zen Mode
                        </button>
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notifications</h3>
                      <NotificationSettings
                        onNotificationChange={(isEnabled) => {
                          onNotificationChange(isEnabled);
                        }}
                        isNotificationEnabled={isNotificationEnabled}
                      />
                    </div>
                  </div>
                )}

                {/* Appearance Category */}
                {activeCategory === 'appearance' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Custom Theme</h3>
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

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Background Music</h3>
                      <BackgroundMusic
                        onMusicChange={onMusicChange}
                        currentMusic={currentMusic}
                        isPlaying={isMusicPlaying}
                        onPlayingChange={onMusicPlayingChange}
                      />
                    </div>
                  </div>
                )}

                {/* Productivity Category */}
                {activeCategory === 'productivity' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Calendar Integration</h3>
                      <CalendarIntegration
                        onEventSelect={onCalendarEventSelect || (() => {})}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">To-Do List Integration</h3>
                      <button
                        onClick={openTodoistModal}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center">
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 16.518l-4.5-4.319 1.396-1.435 3.078 2.937 6.105-6.218L18.25 8.9l-7.5 7.618z"/>
                          </svg>
                          Import from Todoist
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Notes</h3>
                      <button
                        onClick={onNotesToggle}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          isNotesOpen
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                          {isNotesOpen ? 'Hide Notes' : 'Show Notes'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Data Category */}
                {activeCategory === 'data' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Export to Excel</h3>
                      <ExcelExport
                        tasks={tasks}
                        sessionHistory={sessionHistory}
                        pomodoroTime={pomodoroTime}
                        shortBreakTime={shortBreakTime}
                        longBreakTime={longBreakTime}
                      />
                    </div>
                  </div>
                )}

                {/* Settings Category */}
                {activeCategory === 'settings' && (
                  <div className="space-y-6">
                    <button
                      onClick={() => {
                        onStatisticsClick();
                        setIsOpen(false); // Close menu after clicking
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistics
                    </button>
                    
                    <button
                      onClick={() => {
                        onTimerSettingsClick();
                        setIsOpen(false); // Close menu after clicking
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Timer Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Todoist Modal */}
      {isTodoistModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Import Tasks from Todoist
              </h3>
              <button
                onClick={closeTodoistModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <TodoIntegration onImportTasks={(tasks) => {
                onImportTasks?.(tasks);
                closeTodoistModal();
              }} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}



