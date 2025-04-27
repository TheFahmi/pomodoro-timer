"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ZenMode from '@/components/ZenMode';

export default function ZenModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get timer details from URL params
  const remainingTimeParam = searchParams.get('time');
  const totalTimeParam = searchParams.get('total');
  
  // Set default values or parse from URL
  const [remainingTime, setRemainingTime] = useState(
    remainingTimeParam ? parseInt(remainingTimeParam) : 25 * 60
  );
  const [totalTime] = useState(
    totalTimeParam ? parseInt(totalTimeParam) : 25 * 60
  );
  
  // Decreasing timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Handler to exit zen mode
  const handleExitZenMode = () => {
    router.push('/');
  };
  
  return (
    <ZenMode 
      remainingTime={remainingTime} 
      totalTime={totalTime}
      onToggleZenMode={handleExitZenMode}
    />
  );
}