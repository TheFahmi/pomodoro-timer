"use client";

import { motion } from 'framer-motion';
import { TimerTheme } from './TimerThemeSelector';

interface TimerThemeDemoProps {
  theme: TimerTheme;
}

export default function TimerThemeDemo({ theme }: TimerThemeDemoProps) {
  // Gunakan digitBgColor hanya jika tidak transparan
  const useDigitBg = theme.digitBgColor !== 'bg-transparent';
  
  return (
    <motion.div 
      className="relative w-16 h-16 flex items-center justify-center mx-auto my-1"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Progress circle background */}
      <div className={`absolute inset-0 rounded-full ${theme.backgroundColor}`}></div>
      
      {/* Progress circle fill - showing 75% progress */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <motion.circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          strokeWidth="6"
          stroke="currentColor"
          className={theme.progressColor}
          strokeLinecap="round"
          strokeDasharray="301.6"
          strokeDashoffset="75.4" // 25% filled (301.6 * 0.25)
          transform="rotate(-90 50 50)"
        />
      </svg>
      
      {/* Timer display */}
      <div className={`text-xs font-bold relative z-10 ${useDigitBg ? `px-1 py-0.5 rounded ${theme.digitBgColor}` : ''} ${theme.textColor}`}>
        25:00
      </div>
    </motion.div>
  );
} 