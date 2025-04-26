"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Timer from './Timer';
import Controls from './Controls';
import Settings from './Settings';
import TaskInput from './TaskInput';
import TaskList, { Task } from './TaskList';

// Timer types
type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

// Session history type
type SessionHistory = {
  type: TimerType;
  task: string;
  completed: boolean;
  timestamp: Date;
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
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Play sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.error('Failed to play sound:', err));

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
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === currentTaskId
              ? {
                  ...task,
                  completedPomodoros: task.completedPomodoros + 1,
                  // Auto-complete task if all pomodoros are done
                  completed: task.completedPomodoros + 1 >= task.pomodoros ? true : task.completed
                }
              : task
          )
        );
      }
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
  }, [currentTimer, currentTask, completedPomodoros, pomodoroTime, shortBreakTime, longBreakTime]);

  // Timer controls
  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    // Reset the timer
    setTimeLeft(getCurrentTime());
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', getCurrentTime().toString());
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
    }
  };

  // Settings controls
  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  // Task list handlers
  const handleTaskAdd = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
    if (!currentTaskId) {
      setCurrentTaskId(task.id);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setCurrentTaskId(taskId);
  };

  // Handle task input from the TaskInput component
  const handleTaskInputChange = (taskName: string) => {
    if (taskName.trim() === '') {
      setCurrentTaskId(null);
      return;
    }

    // If there's a current task, update its name
    if (currentTaskId) {
      const currentTaskIndex = tasks.findIndex(task => task.id === currentTaskId);
      if (currentTaskIndex !== -1) {
        const updatedTasks = [...tasks];
        updatedTasks[currentTaskIndex] = {
          ...updatedTasks[currentTaskIndex],
          title: taskName
        };
        setTasks(updatedTasks);
        return;
      }
    }

    // Otherwise, create a new task
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskName,
      completed: false,
      pomodoros: 1,
      completedPomodoros: 0
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setCurrentTaskId(newTask.id);
  };

  // Get timer label
  const getTimerLabel = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  };

  // Get background color based on timer type
  const getBackgroundColor = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return 'bg-rose-50 dark:bg-rose-950';
      case 'shortBreak':
        return 'bg-emerald-50 dark:bg-emerald-950';
      case 'longBreak':
        return 'bg-sky-50 dark:bg-sky-950';
      default:
        return 'bg-gray-100 dark:bg-gray-950';
    }
  };

  // Update document title with timer
  useEffect(() => {
    const timerPrefix = currentTimeFormatted ? `(${currentTimeFormatted}) ` : '';
    document.title = `${timerPrefix}${getTimerLabel()} - Pomodoro Timer`;
  }, [currentTimer, currentTimeFormatted, getTimerLabel]);

  // Handle timer updates
  const handleTimeUpdate = useCallback((time: number, formattedTime: string) => {
    setCurrentTimeFormatted(formattedTime);
    setTimeLeft(time);

    // Save to localStorage for tab synchronization
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroTimeLeft', time.toString());
    }
  }, []);

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

  // Client-side initialization
  useEffect(() => {
    // Mark that we're on the client side
    isClient.current = true;

    // Load data from localStorage
    if (typeof window !== 'undefined') {
      // Load timer type
      const savedTimer = localStorage.getItem('pomodoroCurrentTimer');
      if (savedTimer) {
        setCurrentTimer(savedTimer as TimerType);
      }

      // Load active state
      const savedActive = localStorage.getItem('pomodoroIsActive');
      if (savedActive) {
        setIsActive(savedActive === 'true');
      }

      // Load tasks
      const savedTasks = localStorage.getItem('pomodoroTasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          console.error('Failed to parse tasks from localStorage:', e);
        }
      }

      // Load current task ID
      const savedTaskId = localStorage.getItem('pomodoroCurrentTaskId');
      if (savedTaskId) {
        setCurrentTaskId(savedTaskId);
      }

      // Load completed pomodoros count
      const savedCount = localStorage.getItem('pomodoroCompletedCount');
      if (savedCount) {
        setCompletedPomodoros(parseInt(savedCount, 10));
      }

      // Load time left
      const savedTimeLeft = localStorage.getItem('pomodoroTimeLeft');
      if (savedTimeLeft) {
        setTimeLeft(parseInt(savedTimeLeft, 10));
      } else {
        // If no time left is saved, set it to the current timer duration
        setTimeLeft(getCurrentTime());
      }
    }
  }, [getCurrentTime]);

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
        setTimeLeft(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Pomodoro Timer</h1>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => {
                setCurrentTimer('pomodoro');
                setTimeLeft(pomodoroTime);
                setIsActive(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pomodoroTimeLeft', pomodoroTime.toString());
                }
              }}
              className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${currentTimer === 'pomodoro' ? 'bg-rose-600 text-white' : 'bg-white/80 hover:bg-rose-100 dark:bg-gray-800 dark:hover:bg-rose-900'}`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => {
                setCurrentTimer('shortBreak');
                setTimeLeft(shortBreakTime);
                setIsActive(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pomodoroTimeLeft', shortBreakTime.toString());
                }
              }}
              className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${currentTimer === 'shortBreak' ? 'bg-emerald-600 text-white' : 'bg-white/80 hover:bg-emerald-100 dark:bg-gray-800 dark:hover:bg-emerald-900'}`}
            >
              Short Break
            </button>
            <button
              onClick={() => {
                setCurrentTimer('longBreak');
                setTimeLeft(longBreakTime);
                setIsActive(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pomodoroTimeLeft', longBreakTime.toString());
                }
              }}
              className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${currentTimer === 'longBreak' ? 'bg-sky-600 text-white' : 'bg-white/80 hover:bg-sky-100 dark:bg-gray-800 dark:hover:bg-sky-900'}`}
            >
              Long Break
            </button>
          </div>
          <button
            onClick={toggleSettings}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </header>

        <div className="max-w-2xl mx-auto">
          <main className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8">
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

          <TaskInput onTaskChange={handleTaskInputChange} currentTask={currentTask} />

          <Timer
            initialTime={getCurrentTime()}
            onComplete={handleTimerComplete}
            isActive={isActive}
            onTimeUpdate={handleTimeUpdate}
            initialTimeOverride={isClient.current && timeLeft > 0 ? timeLeft : undefined}
          />

          <Controls
            isActive={isActive}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onSkip={skipTimer}
          />

          <div className="mt-6 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Completed Pomodoros:</span> {completedPomodoros}
              </div>

              {currentTask && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full text-indigo-700 dark:text-indigo-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Current Task:</span> {currentTask}
                </div>
              )}
            </div>
          </div>
          </main>

          <TaskList
            tasks={tasks}
            currentTaskId={currentTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskAdd={handleTaskAdd}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>

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
      </div>
    </div>
  );
}
