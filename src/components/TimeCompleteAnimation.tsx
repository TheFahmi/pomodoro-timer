"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerType } from './PomodoroApp';

export interface TimeCompleteAnimationProps {
  type: TimerType;
  timerType?: TimerType; // For compatibility with PomodoroApp
  isVisible: boolean;
  onClose: () => void;
}

export default function TimeCompleteAnimation({
  type,
  timerType,
  isVisible,
  onClose
}: TimeCompleteAnimationProps) {
  // For compatibility, use timerType if type is not available
  const timerTypeToUse = type || timerType || 'pomodoro';
  
  const [autoClose, setAutoClose] = useState<NodeJS.Timeout | null>(null);

  // Auto close animation after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);

      setAutoClose(timeout);

      return () => {
        if (autoClose) {
          clearTimeout(autoClose);
        }
      };
    }
  }, [isVisible, onClose, autoClose]);

  // Get message based on timer type
  const getMessage = () => {
    switch (timerTypeToUse) {
      case 'pomodoro':
        return 'Time for a break!';
      case 'shortBreak':
      case 'longBreak':
        return 'Back to work!';
      default:
        return 'Time completed!';
    }
  };

  const getColor = () => {
    switch (timerTypeToUse) {
      case 'pomodoro':
        return 'from-rose-500 to-red-700';
      case 'shortBreak':
        return 'from-emerald-500 to-green-700';
      case 'longBreak':
        return 'from-sky-500 to-blue-700';
      default:
        return 'from-indigo-500 to-purple-700';
    }
  };

  const getIcon = () => {
    switch (timerTypeToUse) {
      case 'pomodoro':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shortBreak':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'longBreak':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className={`relative bg-gradient-to-br ${getColor()} rounded-2xl p-10 text-center shadow-2xl max-w-md mx-auto border border-white/20`}
            initial={{ scale: 0.5, y: 50 }}
            animate={{
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{
              scale: 0.5,
              y: -50,
              transition: { duration: 0.2 }
            }}
          >
            {/* Close button in top right */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{
                scale: 1,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.1
                }
              }}
              className="mb-4 flex justify-center"
            >
              {getIcon()}
            </motion.div>

            <motion.div
              className="text-4xl font-bold text-white mt-2 mb-4 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.2 }
              }}
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.1, 1],
                  transition: { 
                    repeat: 2,
                    duration: 0.6,
                    repeatType: 'reverse'
                  }
                }}
              >
                Time&apos;s Up!
              </motion.span>
            </motion.div>

            <motion.p
              className="text-white/90 mt-2 text-xl font-medium"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.3 }
              }}
            >
              {getMessage()}
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.4 }
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="bg-white/25 hover:bg-white/40 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Close
              </button>
            </motion.div>

            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30 rounded-b-2xl overflow-hidden origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}