"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import AnimatedClock from './AnimatedClock';

type TimerProps = {
  initialTime: number;
  onComplete: () => void;
  isActive: boolean;
  onTimeUpdate?: (time: number, formattedTime: string) => void;
  initialTimeOverride?: number;
};

export default function Timer({ initialTime, onComplete, isActive, onTimeUpdate, initialTimeOverride }: TimerProps) {
  // Use a ref to track if we're on the client side
  const isClient = useRef(false);

  // Initialize with the server value to prevent hydration mismatch
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Client-side initialization
  useEffect(() => {
    isClient.current = true;

    // Now that we're on the client, we can safely update to the correct value
    if (initialTimeOverride !== undefined) {
      setTimeLeft(initialTimeOverride);
    } else {
      setTimeLeft(initialTime);
    }
  }, []);

  // Reset timer when initialTime changes or initialTimeOverride is provided
  // Only run this effect after initial client-side hydration
  useEffect(() => {
    if (!isClient.current) return;

    if (initialTimeOverride !== undefined) {
      setTimeLeft(initialTimeOverride);
    } else {
      setTimeLeft(initialTime);
    }
  }, [initialTime, initialTimeOverride]);

  // Timer logic
  useEffect(() => {
    if (!isClient.current || !isActive) return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  // Format time as mm:ss
  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Call onTimeUpdate when time changes
  useEffect(() => {
    if (!isClient.current || !onTimeUpdate) return;

    onTimeUpdate(timeLeft, formatTime());
  }, [timeLeft, formatTime, onTimeUpdate]);

  // Calculate progress percentage
  const progressPercentage = (timeLeft / initialTime) * 100;

  return (
    <div className="text-center">
      <div className="relative inline-block">
        {/* Timer display with animation */}
        <div className="mb-6">
          <AnimatedClock time={formatTime()} />
        </div>

        {/* Progress indicator */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isActive
                ? timeLeft < initialTime * 0.25
                  ? 'bg-rose-500 dark:bg-rose-600'
                  : 'bg-indigo-500 dark:bg-indigo-600'
                : 'bg-gray-400 dark:bg-gray-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
