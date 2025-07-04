"use client";

import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';

interface ControlsProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function Controls({ isActive, onStart, onPause, onReset, onSkip }: ControlsProps) {
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-2 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {!isActive ? (
        <AnimatedButton
          onClick={onStart}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start
        </AnimatedButton>
      ) : (
        <AnimatedButton
          onClick={onPause}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Pause
        </AnimatedButton>
      )}

      <AnimatedButton
        onClick={onReset}
        className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-medium transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Reset
      </AnimatedButton>

      <AnimatedButton
        onClick={onSkip}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03l4.898 7.897a1 1 0 001.715-1.03l-4.898-7.897z" clipRule="evenodd" />
        </svg>
        Skip
      </AnimatedButton>
    </motion.div>
  );
}
