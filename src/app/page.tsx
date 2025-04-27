"use client";

import dynamic from 'next/dynamic';
import PomodoroApp from '@/components/PomodoroApp';

// Import SiteBlocker with dynamic to ensure it only renders client-side
const SiteBlocker = dynamic(() => import('@/components/SiteBlocker'), {
  ssr: false, // Disable server-side rendering
});

export default function Home() {
  return (
    <main>
      <PomodoroApp />
      <SiteBlocker />
    </main>
  );
}
