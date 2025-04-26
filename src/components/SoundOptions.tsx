"use client";

import { useState, useEffect } from 'react';

type SoundOptionsProps = {
  onSoundChange: (sound: string) => void;
  currentSound: string;
};

const AVAILABLE_SOUNDS = [
  { id: 'bell', name: 'Bell', file: '/sounds/bell.mp3' },
  { id: 'digital', name: 'Digital', file: '/sounds/digital.mp3' },
  { id: 'notification', name: 'Notification', file: '/sounds/notification.mp3' },
  { id: 'chime', name: 'Chime', file: '/sounds/chime.mp3' },
];

export default function SoundOptions({ onSoundChange, currentSound }: SoundOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(currentSound || 'notification');

  // Update local state when prop changes
  useEffect(() => {
    if (currentSound) {
      setSelectedSound(currentSound);
    }
  }, [currentSound]);

  const handleSoundSelect = (soundId: string) => {
    setSelectedSound(soundId);
    onSoundChange(soundId);
    
    // Play a preview of the sound
    const sound = AVAILABLE_SOUNDS.find(s => s.id === soundId);
    if (sound) {
      const audio = new Audio(sound.file);
      audio.volume = 0.5; // Lower volume for preview
      audio.play().catch(err => console.error('Failed to play sound preview:', err));
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
        Sound Options
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Select Notification Sound
            </div>
            {AVAILABLE_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => handleSoundSelect(sound.id)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedSound === sound.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  {selectedSound === sound.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={selectedSound === sound.id ? 'ml-2' : 'ml-6'}>
                    {sound.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
