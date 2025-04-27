"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerTheme } from './TimerThemeSelector';

interface TimerProps {
  totalTime: number;
  currentTimeLeft: number;
  isActive: boolean;
  onComplete: () => void;
  theme?: TimerTheme;
}

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Komponen untuk animasi digit
const TimerDigit = ({ digit, bgColor, textColor }: { digit: string; bgColor: string; textColor: string }) => (
  <div className={`relative w-12 h-16 inline-block overflow-hidden ${bgColor}`}>
    <AnimatePresence mode="popLayout">
      <motion.span
        key={digit}
        className={`absolute inset-0 flex items-center justify-center ${textColor}`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  </div>
);

export default function Timer({ 
  totalTime,
  currentTimeLeft,
  theme
}: TimerProps) {
  const prevTimeRef = useRef<string>(formatTime(currentTimeLeft));

  // Use default theme if not provided
  const defaultTheme: TimerTheme = {
    id: 'default',
    name: 'Default',
    progressColor: 'text-indigo-600 dark:text-indigo-500',
    backgroundColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  };

  const currentTheme = theme || defaultTheme;

  // Calculate progress
  const progress = totalTime > 0 ? (currentTimeLeft / totalTime) * 100 : 0;
  const timeString = formatTime(currentTimeLeft);
  const timeDigits = timeString.split(''); // Need minutes and seconds separately for digits

  // Update previous time ref for animation comparison
  useEffect(() => {
    prevTimeRef.current = formatTime(currentTimeLeft);
  }, [currentTimeLeft]);

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="relative h-64 w-64 flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Progress circle background */}
        <div className={`absolute inset-0 rounded-full ${currentTheme.backgroundColor}`}></div>
        
        {/* Progress circle fill */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            strokeWidth="4"
            stroke="currentColor"
            className={currentTheme.progressColor}
            strokeLinecap="round"
            strokeDasharray="301.6" // Circumference for r=48 (2 * pi * 48 approx 301.6)
            initial={{ strokeDashoffset: 301.6 }}
            animate={{ 
              strokeDashoffset: 301.6 - (301.6 * progress) / 100 // Animate based on progress
            }}
            transition={{ duration: 0.5 }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Timer display dengan animasi per digit - using original structure but with correct digits */}
        <motion.div 
          className="text-5xl font-bold relative z-10 flex"
          animate={{ 
            color: currentTimeLeft < 10 ? '#ef4444' : 'inherit' // Use currentTimeLeft
          }}
          transition={{ 
            color: { duration: 0.3 }
          }}
        >
          <TimerDigit 
            digit={timeDigits[0]} // Minute 1
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <TimerDigit 
            digit={timeDigits[1]} // Minute 2
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <div className={`w-4 flex items-center justify-center ${currentTheme.textColor}`}>:</div>
          <TimerDigit 
            digit={timeDigits[3]} // Second 1 (index 3 because of ':')
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <TimerDigit 
            digit={timeDigits[4]} // Second 2 (index 4)
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
