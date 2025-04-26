'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Register service worker manually if workbox is not available
      if (window.workbox === undefined) {
        console.log('Workbox could not be loaded. Manually registering service worker');

        if ('serviceWorker' in navigator) {
          // Register the generated service worker
          navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(err => {
              console.error('Service Worker registration failed:', err);
            });
        }
      } else {
        const wb = window.workbox;

        // Add event listeners to handle PWA lifecycle events
        wb.addEventListener('installed', (event) => {
          console.log(`PWA installed: ${event.type}`);
        });

        wb.addEventListener('controlling', (event) => {
          console.log(`PWA controlling: ${event.type}`);
        });

        wb.addEventListener('activated', (event) => {
          console.log(`PWA activated: ${event.type}`);
        });

        // Register the service worker
        wb.register();
      }
    }
  }, []);

  return null;
}

export default PWARegister;
