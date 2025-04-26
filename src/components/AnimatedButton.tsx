"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
  whileHoverScale?: number;
  whileTapScale?: number;
}

export default function AnimatedButton({
  onClick,
  className = '',
  children,
  whileHoverScale = 1.05,
  whileTapScale = 0.95
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={{ scale: whileHoverScale }}
      whileTap={{ scale: whileTapScale }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }}
    >
      {children}
    </motion.button>
  );
} 