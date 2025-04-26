"use client";

import { useState, useEffect } from 'react';

type BreakReminderProps = {
  isBreakTime: boolean;
  breakDuration: number; // in seconds
};

const BREAK_ACTIVITIES = [
  { id: 'stretch', name: 'Stretch your body', icon: '🧘' },
  { id: 'water', name: 'Drink some water', icon: '💧' },
  { id: 'eyes', name: 'Rest your eyes', icon: '👁️' },
  { id: 'walk', name: 'Take a short walk', icon: '🚶' },
  { id: 'breathe', name: 'Deep breathing', icon: '🌬️' },
  { id: 'posture', name: 'Check your posture', icon: '🧍' },
];

export default function BreakReminder({ isBreakTime, breakDuration }: BreakReminderProps) {
  const [activity, setActivity] = useState(BREAK_ACTIVITIES[0]);
  const [showReminder, setShowReminder] = useState(false);
  const [progress, setProgress] = useState(0);

  // Select a random activity when break starts
  useEffect(() => {
    if (isBreakTime) {
      const randomIndex = Math.floor(Math.random() * BREAK_ACTIVITIES.length);
      setActivity(BREAK_ACTIVITIES[randomIndex]);
      setShowReminder(true);
      setProgress(0);
    } else {
      setShowReminder(false);
    }
  }, [isBreakTime]);

  // Update progress bar during break
  useEffect(() => {
    if (!isBreakTime) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / breakDuration);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakTime, breakDuration]);

  // Auto-hide reminder after 10 seconds
  useEffect(() => {
    if (!showReminder) return;

    const timer = setTimeout(() => {
      setShowReminder(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [showReminder]);

  if (!showReminder) return null;

  return (
    <div className="fixed bottom-4 left-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-indigo-200 dark:border-indigo-800 z-50 animate-fade-in-out">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-3xl mr-3">
          {activity.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Break Reminder</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {activity.name}
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <button
          onClick={() => setShowReminder(false)}
          className="ml-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
