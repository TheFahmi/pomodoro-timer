"use client";

import { motion } from 'framer-motion';
import { TimerMode } from '@/types';

interface TimerModeSelectorProps {
  mode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

export default function TimerModeSelector({ mode, onModeChange }: TimerModeSelectorProps) {
  const modes: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div className="flex justify-center space-x-2">
      {modes.map((timerMode) => (
        <motion.button
          key={timerMode.id}
          onClick={() => onModeChange(timerMode.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            mode === timerMode.id
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {timerMode.label}
        </motion.button>
      ))}
    </div>
  );
}
