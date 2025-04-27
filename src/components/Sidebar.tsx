"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector, { Theme } from './ThemeSelector';
import TimerThemeSelector, { TimerTheme } from './TimerThemeSelector';
import SoundOptions from './SoundOptions';
import CustomThemeSelector, { CustomThemeColors } from './CustomThemeSelector';
import { FocusModeOptions } from './FocusMode';
import { DoNotDisturbOptions } from './DoNotDisturbMode';

interface SidebarProps {
  // Open/close state
  isOpen: boolean;
  onClose: () => void;
  
  // Theme options
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentTimerThemeId: string;
  onTimerThemeChange: (theme: TimerTheme) => void;
  
  // Sound options
  currentSound: string;
  onSoundChange: (sound: string) => void;
  
  // Custom theme options
  customTheme: CustomThemeColors;
  onCustomThemeChange: (colors: CustomThemeColors) => void;
  
  // Task view options
  isSequentialTaskView: boolean;
  onSequentialViewToggle: (isSequential: boolean) => void;
  
  // Focus mode
  isFocusModeEnabled: boolean;
  focusModeOptions: FocusModeOptions;
  onFocusModeChange: (isEnabled: boolean, options?: FocusModeOptions) => void;
  onFocusModeOptionsChange: (options: FocusModeOptions) => void;
  
  // Do Not Disturb
  isDNDEnabled: boolean;
  dndOptions: DoNotDisturbOptions;
  onDNDChange: (isEnabled: boolean, options?: DoNotDisturbOptions) => void;
  onDNDOptionsChange: (options: DoNotDisturbOptions) => void;
  
  // Other settings
  onSettingsClick: () => void;
  onStatisticsClick: () => void;
  onAchievementsClick: () => void;
  onNotesToggle: () => void;
  isNotesOpen: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  currentTimerThemeId,
  onTimerThemeChange,
  currentSound,
  onSoundChange,
  customTheme,
  onCustomThemeChange,
  isSequentialTaskView,
  onSequentialViewToggle,
  isFocusModeEnabled,
  focusModeOptions,
  onFocusModeChange,
  onFocusModeOptionsChange,
  isDNDEnabled,
  dndOptions,
  onDNDChange,
  onDNDOptionsChange,
  onSettingsClick,
  onStatisticsClick,
  onAchievementsClick,
  onNotesToggle,
  isNotesOpen
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<'timer' | 'appearance' | 'productivity' | 'tools'>('timer');

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden flex flex-col"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'timer'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveSection('timer')}
              >
                Timer
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'appearance'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveSection('appearance')}
              >
                Appearance
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'productivity'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveSection('productivity')}
              >
                Focus
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'tools'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveSection('tools')}
              >
                Tools
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'timer' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Timer Settings</h3>
                  
                  <button
                    onClick={onSettingsClick}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Customize Timer Durations
                  </button>
                  
                  <button
                    onClick={onStatisticsClick}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Statistics
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Task View Mode</div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isSequentialTaskView ? 'Sequential View' : 'Standard View'}
                      </span>
                      <button 
                        onClick={() => onSequentialViewToggle(!isSequentialTaskView)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                          isSequentialTaskView ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${
                          isSequentialTaskView ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-3">
                      {isSequentialTaskView 
                        ? 'Sequential View: Complete tasks in order'
                        : 'Standard View: Choose any task to work on'}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sound</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                      <SoundOptions
                        onSoundChange={onSoundChange}
                        currentSound={currentSound}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'appearance' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Themes</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Theme</h4>
                    <ThemeSelector
                      onThemeChange={onThemeChange}
                      currentThemeId={currentTheme.id}
                    />
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timer Theme</h4>
                    <TimerThemeSelector
                      onThemeChange={onTimerThemeChange}
                      currentThemeId={currentTimerThemeId}
                    />
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Theme</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-1 pb-1">
                      <CustomThemeSelector
                        onThemeChange={onCustomThemeChange}
                        currentTheme={customTheme}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'productivity' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Focus Settings</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Mode</h4>
                      <button 
                        onClick={() => onFocusModeChange(!isFocusModeEnabled, focusModeOptions)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                          isFocusModeEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${
                          isFocusModeEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                      Minimize distractions during focus sessions
                    </p>
                    
                    {isFocusModeEnabled && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Dark Theme</span>
                          <button 
                            onClick={() => onFocusModeOptionsChange({
                              ...focusModeOptions,
                              darkTheme: !focusModeOptions.darkTheme
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              focusModeOptions.darkTheme ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              focusModeOptions.darkTheme ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Hide Task List</span>
                          <button 
                            onClick={() => onFocusModeOptionsChange({
                              ...focusModeOptions,
                              hideTaskList: !focusModeOptions.hideTaskList
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              focusModeOptions.hideTaskList ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              focusModeOptions.hideTaskList ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Hide Controls</span>
                          <button 
                            onClick={() => onFocusModeOptionsChange({
                              ...focusModeOptions,
                              hideControls: !focusModeOptions.hideControls
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              focusModeOptions.hideControls ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              focusModeOptions.hideControls ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Fullscreen</span>
                          <button 
                            onClick={() => onFocusModeOptionsChange({
                              ...focusModeOptions,
                              fullscreen: !focusModeOptions.fullscreen
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              focusModeOptions.fullscreen ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              focusModeOptions.fullscreen ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Do Not Disturb</h4>
                      <button 
                        onClick={() => onDNDChange(!isDNDEnabled, dndOptions)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                          isDNDEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${
                          isDNDEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2">
                      Block distracting websites during focus time
                    </p>
                    
                    {isDNDEnabled && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Block Websites</span>
                          <button 
                            onClick={() => onDNDOptionsChange({
                              ...dndOptions,
                              blockWebsites: !dndOptions.blockWebsites
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              dndOptions.blockWebsites ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              dndOptions.blockWebsites ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Auto-Enable</span>
                          <button 
                            onClick={() => onDNDOptionsChange({
                              ...dndOptions,
                              autoEnable: !dndOptions.autoEnable
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              dndOptions.autoEnable ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              dndOptions.autoEnable ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Show Notifications</span>
                          <button 
                            onClick={() => onDNDOptionsChange({
                              ...dndOptions,
                              showNotification: !dndOptions.showNotification
                            })}
                            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                              dndOptions.showNotification ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white ${
                              dndOptions.showNotification ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeSection === 'tools' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Useful Tools</h3>
                  
                  <button 
                    onClick={onAchievementsClick}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Achievements
                  </button>
                  
                  <button
                    onClick={onNotesToggle}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Session Notes {isNotesOpen ? '(Close)' : ''}
                  </button>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Pomodoro Timer v1.0
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
