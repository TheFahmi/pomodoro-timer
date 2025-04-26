"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerTheme } from './TimerThemeSelector';

interface TimerProps {
  initialTime: number;
  isActive: boolean;
  onComplete: () => void;
  onTimeUpdate: (time: number) => void;
  initialTimeOverride?: number;
  theme?: TimerTheme;
}

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
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
  initialTime, 
  isActive, 
  onComplete, 
  onTimeUpdate,
  initialTimeOverride,
  theme
}: TimerProps) {
  // Use initialTimeOverride if provided, otherwise use initialTime
  const [timeLeft, setTimeLeft] = useState(initialTimeOverride ?? initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTimeRef = useRef<string>(formatTime(timeLeft));

  // Menggunakan tema default jika tidak ada tema yang diberikan
  const defaultTheme: TimerTheme = {
    id: 'default',
    name: 'Default',
    progressColor: 'text-indigo-600 dark:text-indigo-500',
    backgroundColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-900 dark:text-white',
    digitBgColor: 'bg-transparent'
  };

  const currentTheme = theme || defaultTheme;

  // Reset timer when initialTime changes
  useEffect(() => {
    if (!isActive && initialTimeOverride === undefined) {
      setTimeLeft(initialTime);
      onTimeUpdate(initialTime);
    }
  }, [initialTime, isActive, onTimeUpdate, initialTimeOverride]);

  // Reset timer when initialTimeOverride changes
  useEffect(() => {
    if (initialTimeOverride !== undefined) {
      setTimeLeft(initialTimeOverride);
      onTimeUpdate(initialTimeOverride);
    }
  }, [initialTimeOverride, onTimeUpdate]);

  // Handle timer tick
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Update parent with new time
          // onTimeUpdate(newTime, formatTime(newTime)); // Memicu update state selama render
          
          if (newTime <= 0) {
            // Timer complete
            clearInterval(intervalRef.current as NodeJS.Timeout);
            onComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onComplete, onTimeUpdate]);

  // Separate effect to notify parent of time changes
  useEffect(() => {
    // Only notify parent when time changes and not during initial render
    if (timeLeft !== initialTimeOverride && timeLeft !== initialTime) {
      onTimeUpdate(timeLeft);
    }
  }, [timeLeft, onTimeUpdate, initialTime, initialTimeOverride]);

  // Calculate progress percentage
  const progress = (timeLeft / initialTime) * 100;
  
  // Format time string untuk animasi
  const timeString = formatTime(timeLeft);
  const timeDigits = timeString.split('');
  
  // Perbarui referensi waktu sebelumnya
  useEffect(() => {
    prevTimeRef.current = timeString;
  }, [timeString]);
  
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
            strokeDasharray="301.6"
            initial={{ strokeDashoffset: 301.6 }}
            animate={{ 
              strokeDashoffset: 301.6 - (301.6 * progress) / 100 
            }}
            transition={{ duration: 0.5 }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Timer display dengan animasi per digit */}
        <motion.div 
          className="text-5xl font-bold relative z-10 flex"
          animate={{ 
            color: timeLeft < 10 ? '#ef4444' : 'inherit' 
          }}
          transition={{ 
            color: { duration: 0.3 }
          }}
        >
          <TimerDigit 
            digit={timeDigits[0]} 
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <TimerDigit 
            digit={timeDigits[1]} 
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <div className={`w-4 flex items-center justify-center ${currentTheme.textColor}`}>:</div>
          <TimerDigit 
            digit={timeDigits[3]} 
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
          <TimerDigit 
            digit={timeDigits[4]} 
            bgColor={currentTheme.digitBgColor}
            textColor={currentTheme.textColor}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
