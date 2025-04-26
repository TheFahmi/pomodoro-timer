"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './Timer';
import Controls from './Controls';
import Settings from './Settings';
import TaskInput from './TaskInput';
import TaskList, { Task } from './TaskList';
import SoundOptions from './SoundOptions';
import FocusMode from './FocusMode';
import ThemeSelector, { Theme } from './ThemeSelector';
import MotivationalQuote from './MotivationalQuote';
import Statistics from './Statistics';
import NotificationSettings from './NotificationSettings';
import BackgroundMusic from './BackgroundMusic';
import BreakReminder from './BreakReminder';
import SettingsMenu from './SettingsMenu';
import ToolsMenu from './ToolsMenu';
import TabSyncIndicator from './TabSyncIndicator';
import SequentialTaskList from './SequentialTaskList';
import { GamificationData } from './Gamification';
import Achievements, { Achievement } from './Achievements';
import { TabSynchronization } from '../utils/tabSynchronization';
import { FocusModeOptions } from './FocusMode';
import {
  defaultGamificationData,
  processCompletedPomodoro,
  processCompletedTask,
  calculateTotalFocusTime,
  calculateCompletedTasks
} from '../utils/gamificationUtils';
import TimeCompleteAnimation from './TimeCompleteAnimation';
import TimerTransition from './TimerTransition';
import TimerThemeSelector, { TimerTheme, timerThemes } from './TimerThemeSelector';
import { useTheme } from 'next-themes';

// Timer types
export type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

// Session history type
export type SessionHistory = {
  type: TimerType;
  task: string;
  completed: boolean;
  timestamp: Date;
};

// Format time as MM:SS utility function
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function PomodoroApp() {
  // Timer settings (in seconds)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [shortBreakTime, setShortBreakTime] = useState(5 * 60);
  const [longBreakTime, setLongBreakTime] = useState(15 * 60);

  // Use a ref to track if we're on the client side
  const isClient = useRef(false);

  // Current timer state - initialize with default values for SSR
  const [currentTimer, setCurrentTimer] = useState<TimerType>('pomodoro');

  // Initialize with default values for SSR
  const [isActive, setIsActive] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Derive current task from currentTaskId
  const currentTask = currentTaskId
    ? tasks.find(task => task.id === currentTaskId)?.title || ''
    : '';

  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  // New feature states
  const [currentSound, setCurrentSound] = useState('notification');
  const [isFocusModeEnabled, setIsFocusModeEnabled] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [gamificationData, setGamificationData] = useState<GamificationData>(defaultGamificationData);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [timeCompleteVisible, setTimeCompleteVisible] = useState(false);
  const [timerTransitionVisible, setTimerTransitionVisible] = useState(false);
  const [previousTimer, setPreviousTimer] = useState<TimerType | null>(null);
  const [currentTimerThemeId, setCurrentTimerThemeId] = useState('default');
  const [currentTimerTheme, setCurrentTimerTheme] = useState<TimerTheme>(timerThemes[0]);

  // Background music states
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Tab synchronization
  const [tabSync] = useState<TabSynchronization>(() => new TabSynchronization());
  const [activeTabsCount, setActiveTabsCount] = useState(1);
  const [isSequentialTaskView, setIsSequentialTaskView] = useState(false);

  // Set up tab synchronization listeners
  useEffect(() => {
    if (!tabSync) return;

    // Listen for timer changes from other tabs
    tabSync.onMessage('TIMER_CHANGE', (message) => {
      if (message.data && message.data.timer) {
        setCurrentTimer(message.data.timer);
        if (message.data.time) {
          setTimeLeft(message.data.time);
        }
      }
    });

    // Listen for timer start/pause from other tabs
    tabSync.onMessage('TIMER_START', () => {
      setIsActive(true);
    });

    tabSync.onMessage('TIMER_PAUSE', () => {
      setIsActive(false);
    });

    // Listen for timer reset from other tabs
    tabSync.onMessage('TIMER_RESET', (message) => {
      setIsActive(false);
      if (message.data && message.data.time) {
        setTimeLeft(message.data.time);
      }
    });

    // Listen for timer skip from other tabs
    tabSync.onMessage('TIMER_SKIP', (message) => {
      setIsActive(false);
      if (message.data) {
        if (message.data.timer) {
          setCurrentTimer(message.data.timer);
        }
        if (message.data.time) {
          setTimeLeft(message.data.time);
        }
      }
    });

    // Listen for timer updates from other tabs
    tabSync.onMessage('TIMER_UPDATE', (message) => {
      if (message.data && message.data.time) {
        setTimeLeft(message.data.time);
      }
    });

    return () => {
      // Clean up listeners
      tabSync.offMessage('TIMER_CHANGE', () => {});
      tabSync.offMessage('TIMER_START', () => {});
      tabSync.offMessage('TIMER_PAUSE', () => {});
      tabSync.offMessage('TIMER_RESET', () => {});
      tabSync.offMessage('TIMER_SKIP', () => {});
      tabSync.offMessage('TIMER_UPDATE', () => {});
    };
  }, [tabSync]);

  // Focus mode options
  const [focusModeOptions, setFocusModeOptions] = useState<FocusModeOptions>({
    darkTheme: true,
    hideTaskList: true,
    hideControls: false,
    fullscreen: false,
  });
  const [currentTheme, setCurrentTheme] = useState<Theme>({
    id: 'default',
    name: 'Default',
    primaryColor: 'bg-indigo-600',
    secondaryColor: 'bg-rose-600',
    accentColor: 'bg-emerald-600',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
  });

  // Get current timer duration based on type
  const getCurrentTime = useCallback(() => {
    switch (currentTimer) {
      case 'pomodoro':
        return pomodoroTime;
      case 'shortBreak':
        return shortBreakTime;
      case 'longBreak':
        return longBreakTime;
      default:
        return pomodoroTime;
    }
  }, [currentTimer, pomodoroTime, shortBreakTime, longBreakTime]);

  // Get timer label
  const getTimerLabel = useCallback(() => {
    switch (currentTimer) {
      case 'pomodoro':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  }, [currentTimer]);

  // Show notification
  const showNotification = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || !isNotificationEnabled) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        silent: false // We're already playing a sound
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [isNotificationEnabled]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Play selected sound
    let soundPath = '/sounds/notification.mp3'; // Default sound

    // Map sound ID to file path
    switch (currentSound) {
      case 'bell':
        soundPath = '/sounds/bell.mp3';
        break;
      case 'digital':
        soundPath = '/sounds/digital.mp3';
        break;
      case 'chime':
        soundPath = '/sounds/chime.mp3';
        break;
      case 'notification':
      default:
        soundPath = '/sounds/notification.mp3';
        break;
    }

    const audio = new Audio(soundPath);
    audio.play().catch(err => console.error('Failed to play sound:', err));

    // Show animation
    setTimeCompleteVisible(true);

    // Show notification based on timer type
    if (isNotificationEnabled) {
      const title = `${getTimerLabel()} Completed!`;
      const body = currentTimer === 'pomodoro'
        ? 'Time for a break!'
        : 'Time to focus again!';

      showNotification(title, body);
    }

    // Add to history
    setSessionHistory(prev => [
      ...prev,
      {
        type: currentTimer,
        task: currentTask,
        completed: true,
        timestamp: new Date()
      }
    ]);

    // Update completed pomodoros count
    if (currentTimer === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);

      // Update completed pomodoros for the current task
      if (currentTaskId) {
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task =>
            task.id === currentTaskId
              ? {
                  ...task,
                  completedPomodoros: task.completedPomodoros + 1,
                  // Auto-complete task if all pomodoros are done
                  completed: task.completedPomodoros + 1 >= task.pomodoros ? true : task.completed
                }
              : task
          );

          // Check if task was completed with this pomodoro
          const currentTask = prevTasks.find(t => t.id === currentTaskId);
          const updatedTask = updatedTasks.find(t => t.id === currentTaskId);

          if (currentTask && updatedTask && !currentTask.completed && updatedTask.completed) {
            // Task was just completed, update gamification data
            setGamificationData(prevData => {
              const updatedData = processCompletedTask(
                prevData,
                completedPomodoros + 1,
                calculateCompletedTasks(updatedTasks) + 1,
                calculateTotalFocusTime(sessionHistory, pomodoroTime)
              );

              // Save to localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('pomodoroGamification', JSON.stringify(updatedData));
              }

              return updatedData;
            });
          }

          return updatedTasks;
        });
      }

      // Update gamification data for completed pomodoro
      setGamificationData(prevData => {
        const updatedData = processCompletedPomodoro(
          prevData,
          pomodoroTime,
          completedPomodoros + 1,
          calculateCompletedTasks(tasks),
          calculateTotalFocusTime(sessionHistory, pomodoroTime) + pomodoroTime
        );

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('pomodoroGamification', JSON.stringify(updatedData));
        }

        return updatedData;
      });
    }

    // Determine next timer type
    let nextTimer: TimerType;
    if (currentTimer === 'pomodoro') {
      // After every 4 pomodoros, take a long break
      if ((completedPomodoros + 1) % 4 === 0) {
        nextTimer = 'longBreak';
      } else {
        nextTimer = 'shortBreak';
      }
    } else {
      // After a break, go back to pomodoro
      nextTimer = 'pomodoro';
    }

    setCurrentTimer(nextTimer);

    // Reset the timer for the new timer type
    const newTime = nextTimer === 'pomodoro'
      ? pomodoroTime
      : nextTimer === 'shortBreak'
        ? shortBreakTime
        : longBreakTime;

    setTimeLeft(newTime);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', newTime.toString());
    }

    // Stop the timer
    setIsActive(false);
  }, [currentSound, currentTimer, pomodoroTime, shortBreakTime, longBreakTime, currentTask, currentTaskId, completedPomodoros, isNotificationEnabled, showNotification, getTimerLabel]);

  // Handle closing the time complete animation
  const handleTimeCompleteClose = () => {
    setTimeCompleteVisible(false);
  };

  // Timer controls
  const startTimer = () => {
    setIsActive(true);
    if (typeof window !== 'undefined' && tabSync) {
      tabSync.sendMessage('TIMER_START');
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (typeof window !== 'undefined' && tabSync) {
      tabSync.sendMessage('TIMER_PAUSE');
    }
  };
  const resetTimer = () => {
    setIsActive(false);
    // Reset the timer
    setTimeLeft(getCurrentTime());
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', getCurrentTime().toString());

      // Notify other tabs
      if (tabSync) {
        tabSync.sendMessage('TIMER_RESET', { time: getCurrentTime() });
      }
    }

    // Add to history as incomplete
    setSessionHistory(prev => [
      ...prev,
      {
        type: currentTimer,
        task: currentTask,
        completed: false,
        timestamp: new Date()
      }
    ]);
  };

  const skipTimer = () => {
    setIsActive(false);

    // Add to history as skipped (incomplete)
    setSessionHistory(prev => [
      ...prev,
      {
        type: currentTimer,
        task: currentTask,
        completed: false,
        timestamp: new Date()
      }
    ]);

    // Move to next timer type
    let nextTimer: TimerType;
    if (currentTimer === 'pomodoro') {
      if (completedPomodoros % 4 === 3) {
        nextTimer = 'longBreak';
      } else {
        nextTimer = 'shortBreak';
      }
    } else {
      nextTimer = 'pomodoro';
    }

    setCurrentTimer(nextTimer);

    // Reset the timer for the new timer type
    const newTime = nextTimer === 'pomodoro'
      ? pomodoroTime
      : nextTimer === 'shortBreak'
        ? shortBreakTime
        : longBreakTime;

    setTimeLeft(newTime);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', newTime.toString());
      localStorage.setItem('pomodoroCurrentTimer', nextTimer);

      // Notify other tabs
      if (tabSync) {
        tabSync.sendMessage('TIMER_SKIP', { timer: nextTimer, time: newTime });
      }
    }
  };

  // Settings controls
  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  // Statistics controls
  const toggleStatistics = () => setStatisticsOpen(!statisticsOpen);

  // Sound options handler
  const handleSoundChange = (sound: string) => {
    setCurrentSound(sound);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSound', sound);
    }
  };

  // Focus mode handler
  const handleFocusModeChange = (isEnabled: boolean, options?: FocusModeOptions) => {
    setIsFocusModeEnabled(isEnabled);

    if (options) {
      setFocusModeOptions(options);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pomodoroFocusModeOptions', JSON.stringify(options));
      }

      // Apply fullscreen immediately if focus mode is enabled and the fullscreen option is true
      if (isEnabled && options.fullscreen && typeof document !== 'undefined') {
        const docEl = document.documentElement;
        if (!document.fullscreenElement && docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
          });
        }
      } else if (!isEnabled && document.fullscreenElement) {
        // Exit fullscreen if focus mode is disabled
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroFocusMode', isEnabled.toString());
    }
  };

  // Separate handler just for focus mode options changes
  const handleFocusModeOptionsChange = (options: FocusModeOptions) => {
    setFocusModeOptions(options);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroFocusModeOptions', JSON.stringify(options));
    }

    // Handle fullscreen option immediately if focus mode is enabled
    if (isFocusModeEnabled && options.fullscreen && typeof document !== 'undefined') {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    } else if (isFocusModeEnabled && !options.fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  // Toggle sequential task view
  const toggleSequentialTaskView = () => {
    setIsSequentialTaskView(prev => !prev);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSequentialTaskView', (!isSequentialTaskView).toString());
    }
  };

  // Handle task reordering
  const handleTasksReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTasks', JSON.stringify(reorderedTasks));
    }
  };

  // Notification handler
  const handleNotificationChange = (isEnabled: boolean) => {
    setIsNotificationEnabled(isEnabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroNotifications', isEnabled.toString());
    }
  };

  // Achievements handler
  const toggleAchievements = () => {
    setAchievementsOpen(!achievementsOpen);
  };

  // Handle achievement click
  const handleAchievementClick = (achievement: Achievement) => {
    // Could add special actions when clicking on achievements
    console.log('Achievement clicked:', achievement.title);
  };

  // Background music handlers
  const handleMusicChange = (music: string | null) => {
    setCurrentMusic(music);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroMusic', music || '');
    }
  };

  const handleMusicPlayingChange = (isPlaying: boolean) => {
    setIsMusicPlaying(isPlaying);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroMusicPlaying', isPlaying.toString());
    }
  };

  // Theme handler
  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTheme', JSON.stringify(theme));
    }
  };

  // Timer theme handler
  const handleTimerThemeChange = (theme: TimerTheme) => {
    setCurrentTimerTheme(theme);
    setCurrentTimerThemeId(theme.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimerTheme', JSON.stringify(theme));
    }
  };

  // Load data from localStorage on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Mark that we're on client side
    isClient.current = true;

    // Load saved data
    const savedPomodoroTime = localStorage.getItem('pomodoroPomodoroTime');
    const savedShortBreakTime = localStorage.getItem('pomodoroShortBreakTime');
    const savedLongBreakTime = localStorage.getItem('pomodoroLongBreakTime');
    const savedCurrentTimer = localStorage.getItem('pomodoroCurrentTimer') as TimerType | null;
    const savedIsActive = localStorage.getItem('pomodoroIsActive');
      const savedTasks = localStorage.getItem('pomodoroTasks');
    const savedCurrentTaskId = localStorage.getItem('pomodoroCurrentTaskId');
    const savedCompletedPomodoros = localStorage.getItem('pomodoroCompletedPomodoros');
      const savedSound = localStorage.getItem('pomodoroSound');
      const savedFocusMode = localStorage.getItem('pomodoroFocusMode');
      const savedFocusModeOptions = localStorage.getItem('pomodoroFocusModeOptions');

    // Apply saved settings
    if (savedPomodoroTime) setPomodoroTime(parseInt(savedPomodoroTime));
    if (savedShortBreakTime) setShortBreakTime(parseInt(savedShortBreakTime));
    if (savedLongBreakTime) setLongBreakTime(parseInt(savedLongBreakTime));
    if (savedCurrentTimer) setCurrentTimer(savedCurrentTimer as TimerType);
    if (savedIsActive === 'true') setIsActive(true);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCurrentTaskId) setCurrentTaskId(savedCurrentTaskId);
    if (savedCompletedPomodoros) setCompletedPomodoros(parseInt(savedCompletedPomodoros));
    if (savedSound) setCurrentSound(savedSound);

    if (savedFocusMode === 'true') {
      setIsFocusModeEnabled(true);

      // Apply fullscreen if that option was enabled
      if (savedFocusModeOptions) {
        const options = JSON.parse(savedFocusModeOptions) as FocusModeOptions;
        setFocusModeOptions(options);

        if (options.fullscreen) {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => {
              console.error('Error attempting to enable fullscreen:', err);
            });
          }
        }
      }
    }
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pomodoroCurrentTimer' && e.newValue) {
        setCurrentTimer(e.newValue as TimerType);
      }
      else if (e.key === 'pomodoroIsActive') {
        setIsActive(e.newValue === 'true');
      }
      else if (e.key === 'pomodoroTasks' && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      }
      else if (e.key === 'pomodoroCurrentTaskId') {
        setCurrentTaskId(e.newValue);
      }
      else if (e.key === 'pomodoroCompletedCount' && e.newValue) {
        setCompletedPomodoros(parseInt(e.newValue, 10));
      }
      else if (e.key === 'pomodoroTimeLeft' && e.newValue) {
        const newTimeLeft = parseInt(e.newValue, 10);
        // Only update if the value from storage is different from current state
        if (newTimeLeft !== timeLeft) {
          setTimeLeft(newTimeLeft);
        }
      }
      else if (e.key === 'pomodoroSound' && e.newValue) {
        setCurrentSound(e.newValue);
      }
      else if (e.key === 'pomodoroFocusMode') {
        setIsFocusModeEnabled(e.newValue === 'true');
      }
      else if (e.key === 'pomodoroFocusModeOptions' && e.newValue) {
        try {
          const parsedOptions = JSON.parse(e.newValue);
          setFocusModeOptions(parsedOptions);
        } catch (e) {
          console.error('Failed to parse focus mode options from storage event:', e);
        }
      }
      else if (e.key === 'pomodoroSequentialTaskView') {
        setIsSequentialTaskView(e.newValue === 'true');
      }
      else if (e.key === 'pomodoroNotifications') {
        setIsNotificationEnabled(e.newValue === 'true');
      }
      else if (e.key === 'pomodoroGamification' && e.newValue) {
        try {
          const parsedData = JSON.parse(e.newValue);
          setGamificationData(parsedData);
        } catch (e) {
          console.error('Failed to parse gamification data from storage event:', e);
        }
      }
      else if (e.key === 'pomodoroMusic') {
        setCurrentMusic(e.newValue);
      }
      else if (e.key === 'pomodoroMusicPlaying') {
        setIsMusicPlaying(e.newValue === 'true');
      }
      else if (e.key === 'pomodoroTheme' && e.newValue) {
        try {
          setCurrentTheme(JSON.parse(e.newValue));
        } catch (e) {
          console.error('Failed to parse theme from storage event:', e);
        }
      }
      else if (e.key === 'pomodoroSessionHistory' && e.newValue) {
        try {
          const parsedHistory = JSON.parse(e.newValue);
          // Convert string timestamps back to Date objects
          const formattedHistory = parsedHistory.map((session: { type: TimerType; task: string; completed: boolean; timestamp: string }) => ({
            ...session,
            timestamp: new Date(session.timestamp)
          }));
          setSessionHistory(formattedHistory);
        } catch (e) {
          console.error('Failed to parse session history from storage event:', e);
        }
      }
      else if (e.key === 'pomodoroTimerTheme' && e.newValue) {
        try {
          const parsedTheme = JSON.parse(e.newValue);
          setCurrentTimerTheme(parsedTheme);
          setCurrentTimerThemeId(parsedTheme.id);
        } catch (e) {
          console.error('Failed to parse timer theme from storage event:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handler for timer transition
  const handleTimerChange = (newTimer: TimerType) => {
    if (currentTimer !== newTimer) {
      setPreviousTimer(currentTimer);
      setTimerTransitionVisible(true);
      setCurrentTimer(newTimer);

      const newTime = newTimer === 'pomodoro'
        ? pomodoroTime
        : newTimer === 'shortBreak'
          ? shortBreakTime
          : longBreakTime;

      setTimeLeft(newTime);
      setIsActive(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('pomodoroTimeLeft', newTime.toString());
        localStorage.setItem('pomodoroCurrentTimer', newTimer);

        // Notify other tabs about the timer change
        if (tabSync) {
          tabSync.sendMessage('TIMER_CHANGE', { timer: newTimer, time: newTime });
        }
      }
    }
  };

  // Handle closing the timer transition animation
  const handleTimerTransitionComplete = () => {
    setTimerTransitionVisible(false);
  };

  // Update document title with timer
  useEffect(() => {
    const formattedTime = formatTime(timeLeft); // Format time here
    const timerPrefix = formattedTime ? `(${formattedTime}) ` : '';
    document.title = `${timerPrefix}${getTimerLabel()} - Pomodoro Timer`;
  }, [timeLeft, getTimerLabel]); // Depend on timeLeft directly

  // Handle timer updates from Timer component
  const handleTimeUpdate = useCallback((time: number) => {
    setTimeLeft(time);

    // Save to localStorage for tab synchronization
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', time.toString());

      // Synchronize time across tabs every 5 seconds to avoid too many messages
      if (tabSync && time % 5 === 0) {
        tabSync.sendMessage('TIMER_UPDATE', { time });
      }
    }
  }, [tabSync]); // Removed currentTimeFormatted dependency

  // Save state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroCurrentTimer', currentTimer);
    }
  }, [currentTimer]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroIsActive', isActive.toString());
    }
  }, [isActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentTaskId) {
        localStorage.setItem('pomodoroCurrentTaskId', currentTaskId);
      } else {
        localStorage.removeItem('pomodoroCurrentTaskId');
      }
    }
  }, [currentTaskId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroCompletedCount', completedPomodoros.toString());
    }
  }, [completedPomodoros]);

  // Save session history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionHistory.length > 0) {
      localStorage.setItem('pomodoroSessionHistory', JSON.stringify(sessionHistory));
    }
  }, [sessionHistory]);

  return (
    <>
      <div className={`min-h-screen ${currentTheme.bgClass} transition-colors duration-500`}>
        {isFocusModeEnabled ? (
          // Focus Mode - Only show the timer
          <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FocusMode
                onFocusModeChange={handleFocusModeChange}
                isFocusModeEnabled={isFocusModeEnabled}
                currentOptions={focusModeOptions}
              />
            </motion.div>

            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <motion.h2
                className="text-2xl font-bold text-center mb-6 flex items-center justify-center text-white"
                animate={{
                  color: currentTimer === 'pomodoro'
                    ? '#f43f5e'
                    : currentTimer === 'shortBreak'
                      ? '#10b981'
                      : '#0ea5e9'
                }}
                transition={{ duration: 1 }}
              >
                {currentTimer === 'pomodoro' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : currentTimer === 'shortBreak' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                )}
                {getTimerLabel()}
              </motion.h2>

              {currentTask && (
                <motion.div
                  className="mb-4 text-center"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="inline-flex items-center bg-gray-800 px-4 py-2 rounded-full text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Current Task:</span> {currentTask}
                  </div>
                </motion.div>
              )}

              <Timer
                initialTime={getCurrentTime()}
                onComplete={handleTimerComplete}
                isActive={isActive}
                onTimeUpdate={handleTimeUpdate}
                initialTimeOverride={isClient.current && timeLeft > 0 ? timeLeft : undefined}
                theme={currentTimerTheme}
              />

              <Controls
                isActive={isActive}
                onStart={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
                onSkip={skipTimer}
              />
            </motion.div>
          </div>
        ) : (
          // Normal Mode - Show all components
          <div className="container mx-auto px-4 py-8">
            <motion.header
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="text-4xl font-bold mb-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                Pomodoro Timer
              </motion.h1>
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => handleTimerChange('pomodoro')}
                  className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    currentTimer === 'pomodoro'
                      ? `${currentTheme.primaryColor} text-white`
                      : 'bg-white/80 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <motion.span
                    animate={{ scale: currentTimer === 'pomodoro' ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Pomodoro
                  </motion.span>
                </button>
                <button
                  onClick={() => handleTimerChange('shortBreak')}
                  className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    currentTimer === 'shortBreak'
                      ? `${currentTheme.secondaryColor} text-white`
                      : 'bg-white/80 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <motion.span
                    animate={{ scale: currentTimer === 'shortBreak' ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Short Break
                  </motion.span>
                </button>
                <button
                  onClick={() => handleTimerChange('longBreak')}
                  className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    currentTimer === 'longBreak'
                      ? `${currentTheme.accentColor} text-white`
                      : 'bg-white/80 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <motion.span
                    animate={{ scale: currentTimer === 'longBreak' ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Long Break
                  </motion.span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-4">
                <SoundOptions
                  onSoundChange={handleSoundChange}
                  currentSound={currentSound}
                />

                <ThemeSelector
                  onThemeChange={handleThemeChange}
                  currentThemeId={currentTheme.id}
                />

                <TimerThemeSelector
                  onThemeChange={handleTimerThemeChange}
                  currentThemeId={currentTimerThemeId}
                />

                <ToolsMenu
                  // Focus Mode
                  onFocusModeChange={handleFocusModeChange}
                  onFocusModeOptionsChange={handleFocusModeOptionsChange}
                  isFocusModeEnabled={isFocusModeEnabled}
                  currentFocusModeOptions={focusModeOptions}

                  // Notifications
                  onNotificationChange={handleNotificationChange}
                  isNotificationEnabled={isNotificationEnabled}

                  // Background Music
                  onMusicChange={handleMusicChange}
                  currentMusic={currentMusic}
                  isMusicPlaying={isMusicPlaying}
                  onMusicPlayingChange={handleMusicPlayingChange}

                  // Zen Mode
                  isZenModeActive={false}
                  onZenModeToggle={() => {}}
                  remainingTime={timeLeft}
                  totalTime={getCurrentTime()}

                  // Custom Theme
                  customThemeColors={undefined}
                  onCustomThemeChange={() => {}}

                  // Calendar Integration
                  onCalendarEventSelect={() => {}}

                  // Excel Export
                  tasks={tasks}
                  sessionHistory={sessionHistory}
                  pomodoroTime={pomodoroTime}
                  shortBreakTime={shortBreakTime}
                  longBreakTime={longBreakTime}
                />

                <SettingsMenu
                  onStatisticsClick={toggleStatistics}
                  onSettingsClick={toggleSettings}
                />

                <TabSyncIndicator
                  tabSync={tabSync}
                />

                <button
                  onClick={() => setIsSequentialTaskView(!isSequentialTaskView)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer ${
                    isSequentialTaskView ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700' : ''
                  }`}
                  title={isSequentialTaskView ? "Switch to normal task view" : "Switch to sequential task view"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {isSequentialTaskView ? 'Task List' : 'Sequential Tasks'}
                </button>
              </div>
            </motion.header>

            <div className="max-w-2xl mx-auto">
              <motion.main
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
                  {currentTimer === 'pomodoro' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : currentTimer === 'shortBreak' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  )}
                  {getTimerLabel()}
                </h2>

                <TaskInput onTaskChange={() => {}} currentTask={currentTask} />

                <Timer
                  initialTime={getCurrentTime()}
                  onComplete={handleTimerComplete}
                  isActive={isActive}
                  onTimeUpdate={handleTimeUpdate}
                  initialTimeOverride={isClient.current && timeLeft > 0 ? timeLeft : undefined}
                  theme={currentTimerTheme}
                />

                {(!isFocusModeEnabled || !focusModeOptions.hideControls) && (
                <Controls
                  isActive={isActive}
                  onStart={startTimer}
                  onPause={pauseTimer}
                  onReset={resetTimer}
                  onSkip={skipTimer}
                />
                )}

                <div className="mt-6 text-center">
                  <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 flex items-center cursor-default">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Completed Pomodoros:</span> {completedPomodoros}
                    </div>

                    {currentTask && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full text-indigo-700 dark:text-indigo-300 flex items-center cursor-default">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Current Task:</span> {currentTask}
                      </div>
                    )}
                  </div>
                </div>
              </motion.main>

              {/* Motivational quote - only show during breaks or when focus mode is off */}
              <AnimatePresence>
                {(currentTimer !== 'pomodoro' || !isFocusModeEnabled) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MotivationalQuote isBreak={currentTimer !== 'pomodoro'} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className={isFocusModeEnabled && focusModeOptions.hideTaskList ? 'hidden' : ''}
              >
                {isSequentialTaskView ? (
                  <SequentialTaskList
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    onTaskSelect={() => {}}
                    onTasksReorder={handleTasksReorder}
                    onTaskUpdate={() => {}}
                    onTaskDelete={() => {}}
                    completedPomodoros={completedPomodoros}
                  />
                ) : (
                  <TaskList
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    onTaskSelect={() => {}}
                    onTaskAdd={() => {}}
                    onTaskUpdate={() => {}}
                    onTaskDelete={() => {}}
                  />
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Settings
              pomodoroTime={pomodoroTime}
              shortBreakTime={shortBreakTime}
              longBreakTime={longBreakTime}
              onPomodoroTimeChange={setPomodoroTime}
              onShortBreakTimeChange={setShortBreakTime}
              onLongBreakTimeChange={setLongBreakTime}
              isOpen={settingsOpen}
              onClose={toggleSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statisticsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Statistics
              isOpen={statisticsOpen}
              onClose={toggleStatistics}
              sessionHistory={sessionHistory}
              completedPomodoros={completedPomodoros}
              pomodoroTime={pomodoroTime}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {achievementsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Achievements
              isOpen={achievementsOpen}
              onClose={toggleAchievements}
              achievements={gamificationData.achievements}
              onAchievementClick={handleAchievementClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Reminder */}
      <BreakReminder
        isBreakTime={currentTimer !== 'pomodoro'}
        breakDuration={currentTimer === 'shortBreak' ? shortBreakTime : longBreakTime}
      />

      <TimeCompleteAnimation
        isVisible={timeCompleteVisible}
        type={currentTimer}
        onClose={handleTimeCompleteClose}
      />

      <TimerTransition
        previousTimer={previousTimer}
        currentTimer={currentTimer}
        isVisible={timerTransitionVisible}
        onComplete={handleTimerTransitionComplete}
      />
    </>
  );
}

