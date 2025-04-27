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
  };

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Notification Sound</div>
      
      <div className="grid grid-cols-2 gap-1">
        {AVAILABLE_SOUNDS.map((sound) => (
          <button
            key={sound.id}
            onClick={() => handleSoundSelect(sound.id)}
            className={`flex items-center justify-start px-2 py-1 text-xs rounded ${
              selectedSound === sound.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {selectedSound === sound.id && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className={selectedSound === sound.id ? '' : 'ml-4'}>
              {sound.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
