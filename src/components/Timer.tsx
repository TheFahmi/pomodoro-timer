"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  initialTime: number;
  isActive: boolean;
  onComplete: () => void;
  onTimeUpdate: (time: number, formattedTime: string) => void;
  initialTimeOverride?: number;
}

export default function Timer({ 
  initialTime, 
  isActive, 
  onComplete, 
  onTimeUpdate,
  initialTimeOverride 
}: TimerProps) {
  // Use initialTimeOverride if provided, otherwise use initialTime
  const [timeLeft, setTimeLeft] = useState(initialTimeOverride ?? initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer when initialTime changes
  useEffect(() => {
    if (!isActive && initialTimeOverride === undefined) {
      setTimeLeft(initialTime);
      onTimeUpdate(initialTime, formatTime(initialTime));
    }
  }, [initialTime, isActive, onTimeUpdate, initialTimeOverride]);

  // Reset timer when initialTimeOverride changes
  useEffect(() => {
    if (initialTimeOverride !== undefined) {
      setTimeLeft(initialTimeOverride);
      onTimeUpdate(initialTimeOverride, formatTime(initialTimeOverride));
    }
  }, [initialTimeOverride, onTimeUpdate]);

  // Handle timer tick
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Update parent with new time
          onTimeUpdate(newTime, formatTime(newTime));
          
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

  // Calculate progress percentage
  const progress = (timeLeft / initialTime) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="relative h-64 w-64 flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Progress circle background */}
        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Progress circle fill */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            strokeWidth="4"
            stroke="currentColor"
            className="text-indigo-600 dark:text-indigo-500"
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
        
        {/* Timer display */}
        <motion.div 
          className="text-5xl font-bold relative z-10"
          animate={{ 
            scale: isActive ? [1, 1.03, 1] : 1,
            color: timeLeft < 10 ? '#ef4444' : '#000000' 
          }}
          transition={{ 
            scale: { 
              repeat: isActive ? Infinity : 0, 
              duration: 2,
              repeatType: "reverse"
            },
            color: { duration: 0.3 }
          }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </motion.div>
    </div>
  );
}
