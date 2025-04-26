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
    if (prevValue === null) {
      setPrevValue(value);
      firstRender.current = false;
      return;
    }

    // Don't animate if it's the first render
    if (firstRender.current) {
      firstRender.current = false;
      setPrevValue(value);
      return;
    }

    // Only animate if the value has changed
    if (value !== prevValue) {
      setAnimate(true);

      const timer = setTimeout(() => {
        setPrevValue(value);
        setAnimate(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  // Only render the full component on the client side after hydration
  if (prevValue === null) {
    return (
      <div className="relative w-16 h-24 mx-1 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
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
          className={`absolute ${
            animate
              ? 'digit-animate-out'
              : 'opacity-100 transform scale-100'
          }`}
        >
          <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">{prevValue}</span>
        </div>

        {/* New digit that will animate in */}
        {animate && (
          <div
            className="absolute opacity-0 transform scale-50 digit-animate-in"
          >
            <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
