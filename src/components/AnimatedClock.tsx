"use client";

import AnimatedDigit from './AnimatedDigit';

interface AnimatedClockProps {
  time: string; // Format: "mm:ss"
}

export default function AnimatedClock({ time }: AnimatedClockProps) {
  // Split the time string into individual digits
  const digits = time.split('');
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex">
        <AnimatedDigit value={digits[0] || '0'} />
        <AnimatedDigit value={digits[1] || '0'} />
      </div>
      
      <div className="mx-2 flex flex-col items-center justify-center">
        <div className="h-2 w-2 bg-current rounded-full mb-2"></div>
        <div className="h-2 w-2 bg-current rounded-full"></div>
      </div>
      
      <div className="flex">
        <AnimatedDigit value={digits[3] || '0'} />
        <AnimatedDigit value={digits[4] || '0'} />
      </div>
    </div>
  );
}
