"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { TimerType } from './PomodoroApp';

export interface TimerTransitionProps {
  previousTimer: TimerType | null;
  currentTimer: TimerType;
  isVisible: boolean;
  onComplete: () => void;
}

export default function TimerTransition({
  previousTimer,
  currentTimer,
  isVisible,
  onComplete
}: TimerTransitionProps) {
  const getColorFrom = () => {
    switch (previousTimer) {
      case 'pomodoro':
        return 'from-rose-600';
      case 'shortBreak':
        return 'from-emerald-600';
      case 'longBreak':
        return 'from-sky-600';
      default:
        return 'from-indigo-600';
    }
  };

  const getColorTo = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return 'to-rose-600';
      case 'shortBreak':
        return 'to-emerald-600';
      case 'longBreak':
        return 'to-sky-600';
      default:
        return 'to-indigo-600';
    }
  };

  const getText = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  };

  const getIcon = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shortBreak':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'longBreak':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          onClick={onComplete}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            className={`relative bg-gradient-to-r ${getColorFrom()} ${getColorTo()} rounded-xl p-10 text-center shadow-2xl max-w-md mx-auto`}
            initial={{ scale: 0.8, y: 30, rotate: -2 }}
            animate={{
              scale: 1,
              y: 0,
              rotate: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.4
              }
            }}
            exit={{
              scale: 0.8,
              y: -30,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 }
              }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{
                  scale: [0.9, 1.1, 1],
                  transition: {
                    times: [0, 0.7, 1],
                    duration: 0.8
                  }
                }}
              >
                {getIcon()}
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-white mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.2 }
                }}
              >
                Switching to {getText()} Mode
              </motion.h2>

              <motion.p
                className="text-white/90 mt-2"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.3 }
                }}
              >
                Click anywhere to continue
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}