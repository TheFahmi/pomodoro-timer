"use client";

import AnimatedDigit from './AnimatedDigit';

interface AnimatedClockProps {
  time: string; // Format: "mm:ss"
}

export default function AnimatedClock({ time }: AnimatedClockProps) {
  // Split the time string into individual digits
  const digits = time.split('');

  // Ensure we have exactly 5 characters (mm:ss format)
  const minute1 = digits[0] || '0';
  const minute2 = digits[1] || '0';
  const second1 = digits[3] || '0';
  const second2 = digits[4] || '0';

  return (
    <div className="flex items-center justify-center">
      <div className="flex">
        <AnimatedDigit value={minute1} />
        <AnimatedDigit value={minute2} />
      </div>

      <div className="mx-2 flex flex-col items-center justify-center colon-blink">
        <div className="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full mb-2"></div>
        <div className="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full"></div>
      </div>

      <div className="flex">
        <AnimatedDigit value={second1} />
        <AnimatedDigit value={second2} />
      </div>
    </div>
  );
}
