"use client";

import { useEffect, useState, useRef } from 'react';

interface AnimatedDigitProps {
  value: string;
}

export default function AnimatedDigit({ value }: AnimatedDigitProps) {
  // Use null as initial state to prevent hydration mismatch
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const firstRender = useRef(true);

  // Initialize state on client-side only
  useEffect(() => {
    setPrevValue(value);
  }, []);

  useEffect(() => {
    // Skip animation on first render
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (value !== prevValue) {
      setAnimate(true);

      const timer = setTimeout(() => {
        setPrevValue(value);
        setAnimate(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  // Only render the full component on the client side after hydration
  if (prevValue === null) {
    return (
      <div className="relative w-16 h-24 mx-1 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold">{value}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-24 mx-1 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
      {/* Digit container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Current digit that will animate out */}
        <div
          className={`absolute transition-all duration-300 ${
            animate
              ? 'opacity-0 transform scale-150'
              : 'opacity-100 transform scale-100'
          }`}
        >
          <span className="text-5xl font-bold">{prevValue}</span>
        </div>

        {/* New digit that will animate in */}
        {animate && (
          <div
            className="absolute transition-all duration-300 opacity-0 transform scale-50 animate-in"
            style={{
              animation: 'fadeIn 300ms forwards',
              animationDelay: '150ms',
            }}
          >
            <span className="text-5xl font-bold">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
