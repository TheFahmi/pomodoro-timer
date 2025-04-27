"use client";

import { useState, useEffect, useRef } from 'react';

type BackgroundMusicProps = {
  onMusicChange: (music: string | null) => void;
  currentMusic: string | null;
  isPlaying: boolean;
  onPlayingChange: (isPlaying: boolean) => void;
};

const AVAILABLE_MUSIC = [
  { id: 'lofi', name: 'Lo-Fi Study', file: '/music/lofi.mp3' },
  { id: 'nature', name: 'Nature Sounds', file: '/music/nature.mp3' },
  { id: 'ambient', name: 'Ambient', file: '/music/ambient.mp3' },
  { id: 'piano', name: 'Piano', file: '/music/piano.mp3' },
  { id: null, name: 'No Music', file: '' },
];

export default function BackgroundMusic({ 
  onMusicChange, 
  currentMusic, 
  isPlaying,
  onPlayingChange
}: BackgroundMusicProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume / 100;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [volume]);

  // Update audio source when music changes
  useEffect(() => {
    if (!audioRef.current || !currentMusic) return;
    
    const selectedMusic = AVAILABLE_MUSIC.find(m => m.id === currentMusic);
    if (selectedMusic && selectedMusic.file) {
      audioRef.current.src = selectedMusic.file;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Failed to play background music:', err);
          onPlayingChange(false);
        });
      }
    }
  }, [currentMusic, isPlaying, onPlayingChange]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play/pause when isPlaying changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying && currentMusic) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play background music:', err);
        onPlayingChange(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentMusic, onPlayingChange]);

  const handleMusicSelect = (musicId: string | null) => {
    onMusicChange(musicId);
    setIsOpen(false);
  };

  const togglePlayPause = () => {
    if (!currentMusic) {
      // If no music is selected, select the first one
      onMusicChange(AVAILABLE_MUSIC[0].id);
      onPlayingChange(true);
    } else {
      onPlayingChange(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const getCurrentMusicName = () => {
    const music = AVAILABLE_MUSIC.find(m => m.id === currentMusic);
    return music ? music.name : 'Select Music';
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors cursor-pointer"
          title={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          {getCurrentMusicName()}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="relative w-24 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            title={`Volume: ${volume}%`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Select Background Music
            </div>
            {AVAILABLE_MUSIC.map((music) => (
              <button
                key={music.id || 'none'}
                onClick={() => handleMusicSelect(music.id)}
                className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                  currentMusic === music.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  {currentMusic === music.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={currentMusic === music.id ? 'ml-2' : 'ml-6'}>
                    {music.name}
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
