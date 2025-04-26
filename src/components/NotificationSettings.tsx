"use client";

import { useState, useEffect } from 'react';

type NotificationSettingsProps = {
  onNotificationChange: (isEnabled: boolean) => void;
  isNotificationEnabled: boolean;
};

export default function NotificationSettings({ onNotificationChange, isNotificationEnabled }: NotificationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(isNotificationEnabled);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');

  // Check if notifications are supported and get current permission state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setPermissionState('unsupported');
        return;
      }

      setPermissionState(Notification.permission);
    }
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    setIsEnabled(isNotificationEnabled);
  }, [isNotificationEnabled]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        setIsEnabled(true);
        onNotificationChange(true);
      } else {
        setIsEnabled(false);
        onNotificationChange(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const toggleNotifications = () => {
    if (permissionState !== 'granted') {
      requestPermission();
      return;
    }

    const newState = !isEnabled;
    setIsEnabled(newState);
    onNotificationChange(newState);
  };

  // If notifications are not supported, don't render the component
  if (permissionState === 'unsupported') {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleNotifications}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors cursor-pointer min-w-[180px] justify-center ${
          isEnabled && permissionState === 'granted'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
        title={
          permissionState === 'granted'
            ? isEnabled
              ? 'Disable notifications'
              : 'Enable notifications'
            : 'Request notification permission'
        }
      >
        {permissionState === 'granted' ? (
          isEnabled ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Notifications On
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                <path fillRule="evenodd" d="M3 3.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5z" clipRule="evenodd" />
              </svg>
              Notifications Off
            </>
          )
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              <path d="M14 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Enable Notifications
          </>
        )}
      </button>
    </div>
  );
}
