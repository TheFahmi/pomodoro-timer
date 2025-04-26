"use client";

import { motion } from 'framer-motion';

interface SessionCounterProps {
  completedPomodoros: number;
  longBreakInterval: number;
}

export default function SessionCounter({ completedPomodoros, longBreakInterval }: SessionCounterProps) {
  // Calculate how many pomodoros until next long break
  const pomodorosUntilLongBreak = longBreakInterval - (completedPomodoros % longBreakInterval);
  
  // Create an array of the correct length for our indicators
  const indicators = Array.from({ length: longBreakInterval }, (_, i) => {
    const isCompleted = i < (longBreakInterval - pomodorosUntilLongBreak);
    return isCompleted;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {completedPomodoros > 0 ? (
          <>
            <span className="font-medium">{completedPomodoros}</span> pomodoros completed
          </>
        ) : (
          'No pomodoros completed yet'
        )}
      </div>
      
      <div className="flex space-x-2 items-center">
        {indicators.map((isCompleted, index) => (
          <motion.div
            key={index}
            className={`h-3 w-3 rounded-full ${
              isCompleted 
                ? 'bg-indigo-500 dark:bg-indigo-400' 
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          />
        ))}
      </div>
      
      {pomodorosUntilLongBreak < longBreakInterval && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {pomodorosUntilLongBreak === 0 
            ? 'Time for a long break!' 
            : `${pomodorosUntilLongBreak} more until long break`}
        </div>
      )}
    </div>
  );
}
